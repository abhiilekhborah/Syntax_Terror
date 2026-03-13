from flask import Blueprint, request, jsonify
from models import Report
from database import db

routes = Blueprint("routes", __name__)

@routes.route("/report", methods=["POST"])
def create_report():
    data = request.json

    report = Report(
        latitude=data["latitude"],
        longitude=data["longitude"],
        address=data["address"],
        description=data["description"]
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({"message": "Report saved"})


@routes.route("/reports", methods=["GET"])
def get_reports():
    reports = Report.query.all()
    return jsonify([r.to_dict() for r in reports])
