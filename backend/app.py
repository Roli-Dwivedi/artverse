from dotenv import load_dotenv
load_dotenv()
from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
import os
from models.community import Community, CommunityPost
from models.user import User
from models.artwork import Artwork



def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    HF_API_KEY = os.environ.get('HF_API_KEY')
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
    from routes.chat import chat_bp
    from routes.detect import detect_bp
    from routes.generate import generate_bp
    from routes.profile import profile_bp 
    from flask_migrate import Migrate
    migrate = Migrate(app, db)

    

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(artworks_bp, url_prefix='/api/artworks')
    app.register_blueprint(communities_bp, url_prefix='/api/communities')
    app.register_blueprint(chat_bp)
    app.register_blueprint(detect_bp)
    app.register_blueprint(generate_bp)
    app.register_blueprint(profile_bp)

    with app.app_context():
        db.create_all()
        print("✅ Database tables created!")


    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, 'uploads')
        return send_from_directory(upload_folder, filename)

    return app
app = create_app()

if __name__ == '__main__':
    # This only runs when you do `python app.py`, not when `from app import app`
    print("🎨 ArtVerse backend running on ${import.meta.env.VITE_API_URL}")
    app.run(debug=True, port=5000)
