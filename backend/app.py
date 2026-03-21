from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
import os

def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = 'artverse-secret-key-2026'
    app.config['JWT_SECRET_KEY'] = 'artverse-jwt-secret-2026'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///artverse.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    from routes.auth import auth_bp
    from routes.artworks import artworks_bp
    from routes.communities import communities_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(artworks_bp, url_prefix='/api/artworks')
    app.register_blueprint(communities_bp, url_prefix='/api/communities')

    with app.app_context():
        db.create_all()
        print("✅ Database tables created!")

    return app

if __name__ == '__main__':
    app = create_app()
    print("🎨 ArtVerse backend running on http://localhost:5000")
    app.run(debug=True, port=5000)