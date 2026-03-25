from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.artwork import Artwork


profile_bp = Blueprint("profile", __name__)


@profile_bp.route('/feed', methods=['GET'])
@jwt_required()
def user_feed():
    user_id = get_jwt_identity()
    artworks = Artwork.query.filter_by(user_id=user_id) \
        .order_by(Artwork.created_at.desc()).all()

    return jsonify([{
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "image_path": a.image_path,
        "style": a.style,
        "artist_name": a.artist_name,
        "is_ai_generated": a.is_ai_generated,
        "likes": a.likes,
        "created_at": str(a.created_at)
    } for a in artworks])
