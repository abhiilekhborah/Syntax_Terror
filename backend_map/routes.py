from flask import Blueprint, request, jsonify
from models import Report
from database import db
from datetime import datetime
import math, os, joblib, json

routes = Blueprint("routes", __name__)

# ── Load duplicate detector model ────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'civic_model_export', 'models')
_model, _meta = None, None

try:
    _model = joblib.load(os.path.join(MODEL_DIR, 'duplicate_detector.pkl'))
    with open(os.path.join(MODEL_DIR, 'metadata.json')) as f:
        _meta = json.load(f)
    print(f"[DuplicateDetector] Model loaded — threshold={_meta['best_threshold']}")
except Exception as e:
    print(f"[DuplicateDetector] Model not loaded: {e}. Duplicate check disabled.")

# ── Helpers ───────────────────────────────────────────────────
def _haversine(lat1, lon1, lat2, lon2):
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a  = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def _jaccard(s1, s2):
    a, b = set(str(s1).lower().split()), set(str(s2).lower().split())
    return len(a & b) / len(a | b) if a and b else 0.0

def _tdiff(t1, t2):
    if isinstance(t1, str): t1 = datetime.fromisoformat(t1)
    if isinstance(t2, str): t2 = datetime.fromisoformat(t2)
    if hasattr(t1, 'to_pydatetime'): t1 = t1.to_pydatetime()
    if hasattr(t2, 'to_pydatetime'): t2 = t2.to_pydatetime()
    return abs((t1 - t2).total_seconds()) / 3600

def _features(r1, r2):
    dist  = _haversine(r1['latitude'], r1['longitude'], r2['latitude'], r2['longitude'])
    tdiff = _tdiff(r1['reported_at'], r2['reported_at'])
    tsim  = _jaccard(r1.get('description', ''), r2.get('description', ''))
    gts   = max(0.0, (1 - dist / 500) * (1 - tdiff / 72))
    return {
        'geo_distance_m':  dist,
        'time_diff_hours': tdiff,
        'same_issue_type': int(r1.get('issue_type') == r2.get('issue_type')),
        'same_city':       0,
        'same_ward':       0,
        'text_similarity': round(tsim, 4),
        'same_photo_hash': 0,
        'geo_within_100m': int(dist < 100),
        'geo_within_200m': int(dist < 200),
        'time_within_24h': int(tdiff < 24),
        'high_text_sim':   int(tsim > 0.3),
        'geo_time_score':  round(gts, 4),
        'combined_score':  round(
            int(r1.get('issue_type') == r2.get('issue_type')) * 0.4 + gts * 0.4 + tsim * 0.2, 4
        ),
    }

def check_duplicate(new_report, existing_reports):
    if _model is None or _meta is None:
        return None

    import pandas as pd
    threshold = _meta['best_threshold']
    max_dist  = _meta['max_distance_m']
    max_time  = _meta['max_time_hours']
    feat_cols = _meta['feature_cols']

    candidates = []
    for ex in existing_reports:
        try:
            d = _haversine(new_report['latitude'], new_report['longitude'], ex['latitude'], ex['longitude'])
            if d > max_dist: continue
            t = _tdiff(new_report['reported_at'], ex['reported_at'])
            if t > max_time: continue
            candidates.append((ex, _features(new_report, ex)))
        except Exception:
            continue

    if not candidates:
        return None

    feat_df = pd.DataFrame([c[1] for c in candidates])[feat_cols].fillna(0)
    probs   = _model.predict_proba(feat_df)[:, 1]

    best_score, best_match = 0, None
    for (ex, feats), p in zip(candidates, probs):
        if p >= threshold and p > best_score:
            best_score = p
            best_match = {
                "duplicate":       True,
                "score":           round(float(p), 4),
                "matched_id":      ex['id'],
                "matched_address": ex.get('address', ''),
                "matched_type":    ex.get('issue_type', ''),
                "distance_m":      round(feats['geo_distance_m'], 1),
            }

    return best_match


# ── Routes ────────────────────────────────────────────────────

@routes.route("/report", methods=["POST"])
def create_report():
    data = request.json
    now  = datetime.utcnow()

    new_report = {
        'latitude':    data.get('latitude'),
        'longitude':   data.get('longitude'),
        'issue_type':  data.get('issue_type', 'pothole'),
        'description': data.get('description', ''),
        'reported_at': now.isoformat(),
    }

    # Compare against all open reports in DB
    existing = []
    for r in Report.query.filter(Report.status != 'resolved').all():
        d = r.to_dict()
        d['reported_at'] = r.reported_at.isoformat() if r.reported_at else now.isoformat()
        existing.append(d)

    dup = check_duplicate(new_report, existing)
    if dup:
        return jsonify({
            "duplicate":       True,
            "score":           dup['score'],
            "matched_id":      dup['matched_id'],
            "matched_address": dup['matched_address'],
            "matched_type":    dup['matched_type'],
            "distance_m":      dup['distance_m'],
            "message":         "A similar issue has already been reported nearby.",
        }), 200

    # Save new report
    report = Report(
        latitude    = data.get('latitude'),
        longitude   = data.get('longitude'),
        address     = data.get('address', ''),
        description = data.get('description', ''),
        issue_type  = data.get('issue_type', 'pothole'),
        priority    = data.get('priority', 'low'),
        status      = 'open',
        name        = data.get('name', ''),
        phone       = data.get('phone', ''),
        reported_at = now,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"message": "Report saved", "ticket_id": report.id}), 201


@routes.route("/reports", methods=["GET"])
def get_reports():
    reports = Report.query.order_by(Report.reported_at.desc()).all()
    return jsonify([r.to_dict() for r in reports])


@routes.route("/report/<int:report_id>", methods=["PATCH"])
def update_status(report_id):
    report = Report.query.get_or_404(report_id)
    data   = request.json
    if "status" in data:
        report.status = data["status"]
    db.session.commit()
    return jsonify(report.to_dict())


@routes.route("/report/<int:report_id>", methods=["DELETE"])
def delete_report(report_id):
    report = Report.query.get_or_404(report_id)
    db.session.delete(report)
    db.session.commit()
    return jsonify({"message": "Deleted"})