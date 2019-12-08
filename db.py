# http://flask.pocoo.org/docs/1.0/tutorial/database/
import click
from flask import g, current_app
from flask.cli import with_appcontext
from flask_pymongo import PyMongo

db=None

def init_app(app):
    global db
    db = app


def get_db():
    # if g and "db" not in g:
    #     g.db = PyMongo(current_app)
    # return g.db
    return db

def close_db(e=None):
    db = g.pop("db", None)

    if db is not None:
        db.close()

def get_user(id):
    dbuser = get_db().db.user.find_one({"id": id})
    return dbuser

def save_user(user):
    resp = get_db().db.user.insert_one(user)
    return resp

def get_user_fit(user):
    resp = get_db().db.fit.find_one({"user": user})
    return resp

def get_fit(user):
    resp = get_db().db.fit.find_one({"user": user})
    return resp

def update_fit(id, data):
    resp = get_db().db.fit.replace_one({"id": id}, data)
    return resp

def save_fit(data):
    resp = get_db().db.fit.insert_one(data)
    return resp

def get_bike(id):
    bike = get_db().db.bikes.find_one({"id": id})
    return bike

def get_bikes(id):
    bikes = get_db().db.bikes.find({"user": id})
    return bikes

def create_bike(data):
    resp = get_db().db.bikes.insert_one(data)
    return resp

def update_bike(id, data):
    resp = get_db().db.bikes.replace_one({"id": id}, data)
    return resp

def delete_bike(id):
    resp = get_db().db.bikes.delete_one({"id": id})
    return resp;

#
# def init_app(app):
#     app.teardown_appcontext(close_db)
#     app.cli.add_command(init_db_command)