from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, SavedArtwork
from extensions import db

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    saved_count = SavedArtwork.query.filter_by(user_id=user_id).count()

    return jsonify({
        "id":       user.id,
        "username": user.username,
        "email":    user.email,
        "bio":      user.bio or "",
        "avatar":   user.avatar or "🎨",
        "stats": {
            "artworks_saved": saved_count
        }
    })


@profile_bp.route("/api/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json() or {}

    user.bio    = data.get("bio", "").strip()[:500]
    user.avatar = data.get("avatar", user.avatar)

    db.session.commit()
    return jsonify({"message": "Profile updated", "bio": user.bio, "avatar": user.avatar})


@profile_bp.route("/api/artworks/save", methods=["POST"])
@jwt_required()
def save_artwork():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    image_url = data.get("image_url", "")
    if not image_url:
        return jsonify({"error": "image_url required"}), 400

    existing = SavedArtwork.query.filter_by(user_id=user_id, image_url=image_url).first()
    if existing:
        return jsonify({"message": "Already saved", "id": existing.id}), 200

    saved = SavedArtwork(
        user_id    = user_id,
        title      = data.get("title", "Saved Artwork")[:200],
        image_url  = image_url,
        prompt     = data.get("prompt", ""),
        style      = data.get("style", ""),
        source_tab = data.get("source_tab", "gallery")
    )
    db.session.add(saved)
    db.session.commit()

    return jsonify({"message": "Saved!", "id": saved.id}), 201


@profile_bp.route("/api/artworks/saved", methods=["GET"])
@jwt_required()
def get_saved():
    user_id = get_jwt_identity()
    artworks = SavedArtwork.query.filter_by(user_id=user_id).order_by(SavedArtwork.saved_at.desc()).all()

    return jsonify([a.to_dict() for a in artworks])


@profile_bp.route("/api/artworks/saved/<int:saved_id>", methods=["DELETE"])
@jwt_required()
def delete_saved(saved_id):
    user_id = get_jwt_identity()
    artwork = SavedArtwork.query.filter_by(id=saved_id, user_id=user_id).first()

    if not artwork:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(artwork)
    db.session.commit()
    return jsonify({"message": "Removed"})
@profile_bp.route("/api/test-token", methods=["GET"])
def test_token():
    auth_header = request.headers.get("Authorization", "")
    return jsonify({"header": auth_header})