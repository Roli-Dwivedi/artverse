from extensions import db
from datetime import datetime

class SavedArtwork(db.Model):
    __tablename__ = 'saved_artworks'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title      = db.Column(db.String(200), default='Saved Artwork')
    image_url  = db.Column(db.Text, nullable=False)
    prompt     = db.Column(db.Text, default='')
    style      = db.Column(db.String(100), default='')
    source_tab = db.Column(db.String(50), default='gallery')
    saved_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'title':      self.title,
            'image_url':  self.image_url,
            'prompt':     self.prompt,
            'style':      self.style,
            'source_tab': self.source_tab,
            'saved_at':   self.saved_at.isoformat()
        }