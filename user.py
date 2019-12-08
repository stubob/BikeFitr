from flask_login import UserMixin

import db


class User(UserMixin):
    def __init__(self, id_, name, email):
        self.id = id_
        self.name = name
        self.email = email

    @staticmethod
    def get(user_id):
        dbuser = db.get_user(user_id)
        if not dbuser:
            return None
        user = User(
            id_=dbuser['id'], name=dbuser['name'], email=dbuser['email']
        )
        return user

    @staticmethod
    def create(id_, name, email):
        db.save_user(id, name, email)