from flask import Blueprint, jsonify

communities_bp = Blueprint('communities', __name__)

@communities_bp.route('/', methods=['GET'])
def get_communities():
    communities = [
        {'id': 1, 'name': 'Watercolor World', 'members': 4821, 'emoji': '🌊'},
        {'id': 2, 'name': 'Digital Art Lab', 'members': 9203, 'emoji': '💻'},
        {'id': 3, 'name': 'Oil & Canvas', 'members': 3456, 'emoji': '🖼️'},
        {'id': 4, 'name': 'Sketch & Doodle', 'members': 6789, 'emoji': '✏️'},
    ]
    return jsonify(communities), 200