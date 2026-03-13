from flask import Flask
from flask_cors import CORS
from database import db
from routes import routes

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///reports.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

CORS(app)

app.register_blueprint(routes)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
