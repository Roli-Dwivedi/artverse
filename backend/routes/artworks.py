from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.artwork import Artwork
import os
import uuid

artworks_bp = Blueprint('artworks', __name__)
@jwt_required()
def toggle_like(artwork_id):
    user_id = get_jwt_identity()

    existing = db.session.execute(
        text("SELECT id FROM likes WHERE user_id=:uid AND artwork_id=:aid"),
        {"uid": user_id, "aid": artwork_id}
    ).fetchone()

    artwork = Artwork.query.get_or_404(artwork_id)

    if existing:
        db.session.execute(
            text("DELETE FROM likes WHERE user_id=:uid AND artwork_id=:aid"),
            {"uid": user_id, "aid": artwork_id}
        )
        artwork.likes = max(0, artwork.likes - 1)
        liked = False
    else:
        db.session.execute(
            text("INSERT INTO likes (user_id, artwork_id) VALUES (:uid, :aid)"),
            {"uid": user_id, "aid": artwork_id}
        )
        artwork.likes += 1
        liked = True

    db.session.commit()
    return jsonify({"liked": liked, "likes": artwork.likes})


@artworks_bp.route('/<int:artwork_id>/like-status', methods=['GET'])
@jwt_required()
def like_status(artwork_id):
    user_id = get_jwt_identity()
    existing = db.session.execute(
        text("SELECT id FROM likes WHERE user_id=:uid AND artwork_id=:aid"),
        {"uid": user_id, "aid": artwork_id}
    ).fetchone()
    return jsonify({"liked": existing is not None})


from models.artwork import Artwork
from sqlalchemy import or_


@artworks_bp.route('/search', methods=['GET'])
def search_artworks():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    like = f"%{query}%"
    results = Artwork.query.filter(
        or_(
            Artwork.title.ilike(like),
            Artwork.style.ilike(like),
            Artwork.artist_name.ilike(like),
            Artwork.description.ilike(like)
        )
    ).order_by(Artwork.created_at.desc()).limit(20).all()

    return jsonify([{
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "image_path": a.image_path,
        "style": a.style,
        "artist_name": a.artist_name,
        "is_ai_generated": a.is_ai_generated,
        "likes": a.likes,
        "user_id": a.user_id,
        "created_at": str(a.created_at)
    } for a in results])


# ── GET ALL ARTWORKS ──
@artworks_bp.route('/', methods=['GET'])
def get_artworks():
    artworks = Artwork.query.order_by(Artwork.created_at.desc()).all()
    return jsonify([a.to_dict() for a in artworks]), 200

# ── GET SINGLE ARTWORK ──
@artworks_bp.route('/<int:id>', methods=['GET'])
def get_artwork(id):
    artwork = Artwork.query.get_or_404(id)
    return jsonify(artwork.to_dict()), 200

# ── LIKE ARTWORK ──
@artworks_bp.route('/<int:id>/like', methods=['POST'])
def like_artwork(id):
    artwork = Artwork.query.get_or_404(id)
    artwork.likes += 1
    db.session.commit()
    return jsonify({'likes': artwork.likes}), 200

# ── UPLOAD ARTWORK ──
@artworks_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_artwork():
    user_id = get_jwt_identity()

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Check file type
    allowed = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({'error': 'File type not allowed'}), 400

    # Save file with unique name
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))

    image_path = f"http://localhost:5000/uploads/{filename}"

    # Save to database
    artwork = Artwork(
        title       = request.form.get('title', 'Untitled')[:200],
        artist_name = request.form.get('artist_name', 'Unknown'),
        style       = request.form.get('style', 'Other'),
        description = request.form.get('description', ''),
        image_path  = image_path,
        user_id     = int(user_id),
        likes       = 0
    )
    db.session.add(artwork)
    db.session.commit()

    return jsonify({'message': 'Artwork uploaded!', 'artwork': artwork.to_dict()}), 201