from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.community import Community, CommunityPost   # you'll create this in STEP 2
from models.user import User                              # or however your import is


communities_bp = Blueprint("communities", __name__)


@communities_bp.route('/', methods=['GET'])
def get_communities():
    communities = Community.query.order_by(Community.created_at.desc()).all()
    return jsonify([{
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "category": c.category,
        "member_count": c.member_count,
        "created_at": str(c.created_at)
    } for c in communities])


@communities_bp.route('/', methods=['POST'])
@jwt_required()
def create_community():
    user_id = get_jwt_identity()
    data = request.get_json()

    community = Community(
        name=data['name'],
        description=data.get('description', ''),
        category=data.get('category', 'General'),
        member_count=1,
        created_by=user_id
    )
    db.session.add(community)
    db.session.commit()
    return jsonify({"message": "Community created", "id": community.id}), 201


@communities_bp.route('/<int:community_id>/posts', methods=['GET'])
def get_community_posts(community_id):
    posts = CommunityPost.query.filter_by(community_id=community_id)\
        .order_by(CommunityPost.created_at.desc()).all()
    return jsonify([{
        "id": p.id,
        "content": p.content,
        "user_id": p.user_id,
        "username": User.query.get(p.user_id).username if User.query.get(p.user_id) else "Unknown",
        "created_at": str(p.created_at)
    } for p in posts])


@communities_bp.route('/<int:community_id>/posts', methods=['POST'])
@jwt_required()
def create_post(community_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    post = CommunityPost(
        content=data['content'],
        user_id=user_id,
        community_id=community_id
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({"message": "Post created"}), 201
