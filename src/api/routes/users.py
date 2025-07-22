"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Store, Image, Product, UserPoint, Menu, Category
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
import json
import yaml
from api.constants import ROLE_ADMIN, ROLE_STORE, ROLE_USER
from datetime import timedelta

routes_user = Blueprint('users', __name__, url_prefix='/api/user')

# Allow CORS requests to this API
CORS(routes_user)

# Endpoint de Registracion


@routes_user.route("/register", methods=["POST"])
@routes_user.route('/create', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    passsword_validate = data.get("password_validate")

    if password != passsword_validate:
        return jsonify({"msg": f"Las contraseñas no son iguales", "ok": False}), 400

    if not username or not email or not password:
        return jsonify({"msg": "Datos incompletos", "ok": False}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"msg": "No es posible crear un usuario con esos datos", "ok": False}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    # Si viene un rol lo validamos y lo incorporamos sino va por el default
    if data is not None and "role" in data and len(data['role']) > 1:
        # Validar el ROLE
        valid_types = [f"{ROLE_USER}", f"{ROLE_STORE}", f"{ROLE_ADMIN}"]
        if data['role'] in valid_types:
            new_user.role = data['role'].capitalize()

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))

    # Aramamos la respuesta
    response = jsonify({
        "msg": f"{new_user.role.capitalize()} | {new_user.username} creado con éxito",
        "ok": True,
        "data": new_user.serialize(),
        "access_token": access_token
    })
    return response, 200


@routes_user.route("/admin/list", methods=["GET"])
@jwt_required()
def list_admin():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id,int):
        return jsonify({"msg":f"No se pudo identificar el usuario","ok":False}),400
    
    # Solo Role Admin
    if user.role != ROLE_ADMIN : 
        return jsonify({"msg": f"Usuario no autorizado | {user.role}","ok": False}),401   

    users = User.query.all()
     # Aramamos la respuesta
    response=jsonify({
        "msg": "Listado de usuario",
        "ok": True,
        "data": [user.serialize_register() for user in users]
    })
    return response,200
    return jsonify([user.serialize_register() for user in users]), 200

# Endpoint de Login


@routes_user.route("/login", methods=["POST"])
@routes_user.route("/token", methods=["POST"])
def create_token():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Credenciales inválidas", "ok": False}), 401

    access_token = create_access_token(identity=str(user.id),expires_delta=timedelta(hours=12))
    return jsonify(access_token=access_token, username=user.username, role=user.role, ok=True,id=user.id), 200
