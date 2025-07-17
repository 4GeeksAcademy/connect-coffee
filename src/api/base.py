"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint,current_app
from api.models import db, User, Store,Image,Product,UserPoint,Menu,Category
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,JWTManager
import json,yaml

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Endpoint de Validacion de Seguridad para pruebas
@api.route('/private', methods=['POST', 'GET'])
@api.route('/hello', methods=['POST', 'GET'])
@jwt_required()
def handle_hello():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    response_body = {
        "message": f"Hola {user.username}! Bienvenido gracias por ingresar tus credenciales",
        "ok":True
    }
    return jsonify(response_body), 200

