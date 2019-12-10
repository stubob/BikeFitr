# Python standard libraries
import json
import os

# Third party libraries
import random
import string
import sys

from flask import Flask, redirect, request, url_for, g, render_template, jsonify
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
from flask_pymongo import PyMongo
from oauthlib.oauth2 import WebApplicationClient
import requests

import db
import user
from user import User
from flask_cors import CORS, cross_origin

# Configuration
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

# Flask app setup
app = Flask(__name__)
CORS(app)
app.config.from_object('config')
app.secret_key = os.environ.get("SECRET_KEY") or os.urandom(24)

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

pm = PyMongo(app)
db.init_app(pm)

# @login_manager.unauthorized_handler
# def unauthorized():
#     return "You must be logged in to access this content.", 403


# OAuth2 client setup
client = WebApplicationClient(app.config['GOOGLE_CLIENT_ID'])


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def get_google_provider_cfg():
    return requests.get(app.config['GOOGLE_DISCOVERY_URL']).json()

@app.route("/login")
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

@app.route("/login/callback")
def callback():
    # Get authorization code Google sent back to you
    code = request.args.get("code")
    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]
    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(app.config['GOOGLE_CLIENT_ID'], app.config['GOOGLE_CLIENT_SECRET']),
    )

    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))
    # Now that you have tokens (yay) let's find and hit the URL
    # from Google that gives you the user's profile information,
    # including their Google profile image and email
    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)
    # You want to make sure their email is verified.
    # The user authenticated with Google, authorized your
    # app, and now you've verified their email through Google!
    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400
    # Create a user in your db with the information provided
    # by Google
    user = {
        'id': unique_id, 'name': users_name, 'email': users_email
    }
    session_user = User(
        id_=unique_id, name=users_name, email=users_email
    )

    dbuser = db.get_user(unique_id)

    # Doesn't exist? Add it to the database.
    if not dbuser:
        resp = db.save_user(user)

    # Begin user session by logging the user in
    login_user(session_user)

    # Send user back to homepage
    return redirect(url_for('home'))


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('new_geometry'))


@app.route('/home')
@login_required
def home():
    bikes = db.get_bikes(current_user.email)
    fit = db.get_fit(current_user.email)
    data = {'isLoggedIn': current_user.is_authenticated,
            'bikes': bikes,
            'fit': fit}  # fake user
    return render_template('biketable.html',
                           data=data)


@app.route('/', methods=['GET'])
def new_geometry():
    data = {
        'isLoggedIn': current_user.is_authenticated,
        'owner': True,
        'data': {
            'bike': {}
        }
    }
    if current_user.is_authenticated:
        fit = db.get_user_fit(current_user.email)
        user = current_user.email
    else:
        fit = {}
        user = ''
    data['data']['fit'] = fit
    data['user'] = user
    return render_template('geometry.html',
                           data=data)


@app.route('/save', methods=['POST'])
@login_required
def save_geometry():
    req_data = request.get_json()
    if req_data.get('id'):
        id = req_data['id']
        req_data['user'] = current_user.email
        db.update_bike(id, req_data)
        return jsonify(req_data)
    else:
        id = random_generator()
        req_data['id'] = id
        req_data['user'] = current_user.email
        resp = db.create_bike(req_data)
        data = {'redirect': url_for("geometry_by_id", id=id)}
        return data


@app.route('/geometry/<id>')
def geometry_by_id(id):
    data = db.get_bike(id)
    data['isLoggedIn'] = current_user.is_authenticated
    if current_user.is_authenticated and data.get('user') == current_user.email:
        data['owner'] = True
    else:
        data['owner'] = False
    return render_template('geometry.html',
                           data=data)


@app.route('/geometry/<id>/delete')
@login_required
def delete_geometry_by_id(id):
    data = db.get_bike(id)
    data['isLoggedIn'] =  current_user.is_authenticated
    if data.get('user') == current_user.email:
        db.delete_bike(id)
    return home()


@app.route('/body',  methods=['GET'])
@login_required
def get_body():
    fit = db.get_user_fit(current_user.email)
    data = {'isLoggedIn': current_user.is_authenticated,
            'owner': True,
            'data': fit}
    return render_template('body.html',
                           data=data)


@app.route('/body',  methods=['POST'])
@login_required
def save_body():
    data = {'isLoggedIn': current_user.is_authenticated,
            'owner': True}
    req_data = request.get_json()
    user = current_user.email
    req_data['user'] = user
    if req_data.get('id'):
        id = req_data['id']
        db.update_fit(id, req_data)
        data['data'] = req_data
    else:
        req_data['id'] = random_generator()
        resp = db.save_fit(req_data)
        data['data'] = req_data
    return jsonify(data)


def random_generator():
    return ''.join([random.choice(string.ascii_letters + string.digits) for n in range(12)])


if __name__ == "__main__":
    # app.run(ssl_context='adhoc')
    app.run(ssl_context=('certificate.crt', 'privateKey.key'))
    # app.run(debug=True)
