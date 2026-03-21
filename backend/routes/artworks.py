from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.artwork import Artwork
import os

artworks_bp = Blueprint('artworks', __name__)

@artworks_bp.route('/', methods=['GET'])
def get_artworks():
    artworks = Artwork.query.order_by(Artwork.created_at.desc()).all()
    return jsonify([a.to_dict() for a in artworks]), 200

@artworks_bp.route('/<int:id>', methods=['GET'])
def get_artwork(id):
    artwork = Artwork.query.get_or_404(id)
    return jsonify(artwork.to_dict()), 200

@artworks_bp.route('/<int:id>/like', methods=['POST'])
def like_artwork(id):
    artwork = Artwork.query.get_or_404(id)
    artwork.likes += 1
    db.session.commit()
    return jsonify({'likes': artwork.likes}), 200