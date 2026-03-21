from extensions import db
from datetime import datetime

class Artwork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    image_path = db.Column(db.String(500), nullable=False)
    style = db.Column(db.String(100), default='Unknown')
    is_ai_generated = db.Column(db.Boolean, default=False)
    likes = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_path': self.image_path,
            'style': self.style,
            'is_ai_generated': self.is_ai_generated,
            'likes': self.likes,
            'artist': self.artist.username,
            'created_at': self.created_at.isoformat()
        }