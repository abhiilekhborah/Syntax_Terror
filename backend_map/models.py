from database import db
from datetime import datetime

class Report(db.Model):
    id          = db.Column(db.Integer, primary_key=True)
    latitude    = db.Column(db.Float, nullable=False)
    longitude   = db.Column(db.Float, nullable=False)
    address     = db.Column(db.String(300))
    description = db.Column(db.String(500))
    issue_type  = db.Column(db.String(50), default='pothole')
    priority    = db.Column(db.String(20), default='low')
    status      = db.Column(db.String(30), default='open')
    name        = db.Column(db.String(100))
    phone       = db.Column(db.String(30))
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":          self.id,
            "latitude":    self.latitude,
            "longitude":   self.longitude,
            "address":     self.address,
            "description": self.description,
            "issue_type":  self.issue_type,
            "priority":    self.priority,
            "status":      self.status,
            "name":        self.name,
            "phone":       self.phone,
            "reported_at": self.reported_at.isoformat() if self.reported_at else None,
        }