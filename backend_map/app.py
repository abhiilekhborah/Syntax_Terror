from flask import Flask, send_from_directory
from flask_cors import CORS
from database import db
from routes import routes
import os

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///reports.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
CORS(app)
app.register_blueprint(routes)

with app.app_context():
    db.create_all()

# Serve HTML files from frontend_map folder
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend_map'))
print(f"[app] Serving frontend from: {BASE_DIR}")

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "map.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5001)