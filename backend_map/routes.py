from flask import Blueprint, request, jsonify
from datetime import datetime
import math, os, joblib, json, requests as http_requests

routes = Blueprint("routes", __name__)

# ── Node API base URL ─────────────────────────────────────────
NODE_API = "http://localhost:3000/api"

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
            reported_at = ex.get('reported_at') or ex.get('createdAt', datetime.utcnow().isoformat())
            t = _tdiff(new_report['reported_at'], reported_at)
            if t > max_time: continue
            ex_norm = {**ex, 'reported_at': reported_at}
            candidates.append((ex, _features(new_report, ex_norm)))
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
                "matched_id":      ex.get('_id') or ex.get('id'),
                "matched_address": ex.get('address') or ex.get('location', {}).get('address', ''),
                "matched_type":    ex.get('issue_type') or ex.get('category', ''),
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

    # Fetch existing open reports from MongoDB via Node API
    existing = []
    try:
        resp = http_requests.get(f"{NODE_API}/issues/map", timeout=5)
        if resp.ok:
            raw = resp.json()
            for r in raw:
                loc = r.get('location', {})
                existing.append({
                    'id':          r.get('_id'),
                    '_id':         r.get('_id'),
                    'latitude':    loc.get('latitude'),
                    'longitude':   loc.get('longitude'),
                    'issue_type':  r.get('category'),
                    'description': r.get('title', ''),
                    'address':     loc.get('address', ''),
                    'reported_at': r.get('createdAt', now.isoformat()),
                })
    except Exception as e:
        print(f"[routes] Could not fetch existing reports: {e}")

    # Run duplicate check
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

    # Save to MongoDB via Node API
    try:
        payload = {
            "latitude":    data.get('latitude'),
            "longitude":   data.get('longitude'),
            "address":     data.get('address', ''),
            "description": data.get('description', ''),
            "issue_type":  data.get('issue_type', 'pothole'),
            "priority":    data.get('priority', 'low'),
            "name":        data.get('name', ''),
            "phone":       data.get('phone', ''),
        }
        resp = http_requests.post(f"{NODE_API}/issues/map", json=payload, timeout=5)
        result = resp.json()
        return jsonify({"message": "Report saved", "ticket_id": result.get('ticket_id')}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to save report: {str(e)}"}), 500


@routes.route("/reports", methods=["GET"])
def get_reports():
    try:
        resp = http_requests.get(f"{NODE_API}/issues/map", timeout=5)
        if resp.ok:
            raw = resp.json()
            # Normalize to match what the map frontend expects
            reports = []
            for r in raw:
                loc = r.get('location', {})
                reports.append({
                    'id':          r.get('_id'),
                    'latitude':    loc.get('latitude'),
                    'longitude':   loc.get('longitude'),
                    'address':     loc.get('address', ''),
                    'description': r.get('description', ''),
                    'issue_type':  r.get('category'),
                    'priority':    r.get('priority', 'low'),
                    'status':      r.get('status', 'reported'),
                    'name':        r.get('name', ''),
                    'reported_at': r.get('createdAt', ''),
                })
            return jsonify(reports)
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes.route("/report/<string:report_id>", methods=["PATCH"])
def update_status(report_id):
    data = request.json
    try:
        resp = http_requests.patch(
            f"{NODE_API}/issues/{report_id}/status",
            json=data,
            timeout=5
        )
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes.route("/report/<string:report_id>", methods=["DELETE"])
def delete_report(report_id):
    # Delete not exposed in Node API yet — placeholder
    return jsonify({"message": "Delete not supported via map"}), 501