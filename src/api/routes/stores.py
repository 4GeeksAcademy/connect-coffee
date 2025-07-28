
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
from api.constants import ROLE_ADMIN, ROLE_USER, ROLE_STORE, APIKEY
from sqlalchemy import or_
from api.helpers.users import user_has_role, require_user_role

routes_store = Blueprint('stores', __name__, url_prefix='/api/store')

# Allow CORS requests to this API
CORS(routes_store)


## STORES ##
# Endpoint de creacion de tienda
@routes_store.route('/create', methods=['POST'])
@jwt_required()
def store_create():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    # Se valida el Rol (no seria necesario) y que este activo
    valid_types = [ROLE_STORE, ROLE_ADMIN]
    if user.role.capitalize() not in valid_types or not user.is_active:
        return jsonify({"msg": f"Usuario no autorizado | {user.role}", "ok": False}), 401

    body = json.loads(request.data)
    if body is None or len(body['nombre']) < 1 or len(body['direccion']) < 1:
        return jsonify({"msg": "Los datos enviados no son suficientes"}), 400

   # existing_store=Store.query.filter(or_(Store.nombre == body['nombre'],Store.direccion == body['direccion']),Store.user_id == current_user_id).first()
        # return jsonify({"msg": "No es posible crear una tienda con esos datos","ok":False,"id": existing_store.id}), 409
    existing_store = Store.query.filter(
        Store.user_id == current_user_id).first()
    if existing_store:
        return jsonify({"msg": "El usuario ya tiene una tienda", "ok": False, "id": existing_store.id}), 409

    local_store = Store()
    local_store.nombre = body['nombre']
    local_store.user_id = current_user_id
    local_store.direccion = body['direccion']

    db.session.add(local_store)
    db.session.commit()

    # Aramamos la respuesta
    response = jsonify({
        "msg": "Store creado con exito",
        "ok": True,
        "data": local_store.serialize()
    })
    return response, 200


@routes_store.route('/list', methods=['GET'])
@jwt_required()
def stores_list():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Se valida el Rol (no seria necesario) y que este activo
    valid_types = [ROLE_USER, ROLE_STORE, ROLE_ADMIN]
    if user.role.capitalize() not in valid_types or not user.is_active:
        return jsonify({"msg": f"Usuario no autorizado {user.role}", "ok": False}), 401

    stores = Store.query.filter_by(user_id=user.id).all()
    # Aramamos la respuesta
    response = jsonify({
        "msg": f"Listado de Stores de {user.username}",
        "ok": True,
        "data": [store.serialize() for store in stores]
    })
    return response, 200


@routes_store.route('/admin/list', methods=['GET'])
@jwt_required()
def stores_list_admin():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_ADMIN:
        return jsonify({"msg": "Usuario no autorizado", "ok": False}), 401

    stores = Store.query.all()
    # Aramamos la respuesta
    response = jsonify({
        "msg": "Listado de Stores",
        "ok": True,
        "data": [store.serialize() for store in stores]
    })
    return response, 200
    return jsonify([store.serialize() for store in stores]), 200


# Store Delete
# La tienda debe ser desactivada para poder borrarla
@routes_store.route("/admin/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_store_for(id: int):
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_ADMIN:
        return jsonify({"msg": "Usuario no autorizado", "ok": False}), 401

    store_exists = Store.query.filter_by(id=id, is_active=False).first()
    if not store_exists:
        return jsonify({"msg": f"No existe una Tienda inactiva con ID {id}", "ok": False}), 400

    db.session.delete(store_exists)
    db.session.commit()
    return jsonify({"msg": "Tienda eliminada con exito", "ok": True}), 200


# Store Deactivate
@routes_store.route("/admin/<int:id>/deactivate", methods=["PATCH"])
@jwt_required()
def deactivate_store_for(id: int):

    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_ADMIN:
        return jsonify({"msg": "Usuario no autorizado", "ok": False}), 401

    store_exists = Store.query.filter_by(id=id, is_active=True).first()
    if not store_exists:
        return jsonify({"msg": f"No existe una tienda activa con ID {id}.", "ok": False}), 400

    store_exists.is_active = False
    db.session.add(store_exists)
    db.session.commit()

    # Aramamos la respuesta
    response = jsonify({
        "msg": f"Tienda {store_exists.nombre} deshabilitada con exito",
        "ok": True,
        "data": store_exists.serialize()
    })
    return response, 200

# Store Activate


@routes_store.route("/<int:id>/activate", methods=["PATCH"])
def front_activate_store_for(id: int):

    apikey = request.headers.get('x-api-key')
    if apikey != APIKEY:
        return jsonify({"msg": "Usuario no autorizado"}), 400

    store_exists = Store.query.filter_by(id=id, is_active=False).first()
    if not store_exists:
        return jsonify({"msg": f"No existe una tienda con ID {id} o ya se encuentra activa", "ok": False}), 400

    store_exists.is_active = True
    db.session.add(store_exists)
    db.session.commit()

    # Aramamos la respuesta
    response = jsonify({
        "msg": f"Tienda {store_exists.nombre} habilitada con exito",
        "ok": True,
        "data": store_exists.serialize()
    })
    return response, 200


# Vistas Front
## STORES ##
# Endpoint de listado de tiendas

@routes_store.route('/list/index', methods=['GET'])
def front_stores_list():
    apikey = request.headers.get('x-api-key')
    if apikey != APIKEY:
        return jsonify({"msg": "Usuario no autorizado"}), 400

    stores = Store.query.filter_by(is_active=True).all()
    # Aramamos la respuesta
    response = jsonify({
        "msg": "Listado de Stores",
        "ok": True,
        "data": [store.serialize() for store in stores]
    })
    return response, 200


# Store Get
@routes_store.route("/<int:store_id>/detail", methods=["GET"])
def front_get_storedetail_for(store_id: int):
    apikey = request.headers.get('x-api-key')
    if apikey != APIKEY:
        return jsonify({"msg": "Usuario no autorizado"}), 400

    store_exists = Store.query.filter_by(id=store_id).first()
    # Existencia de Store
    if not store_exists:
        return jsonify({"msg": f"No existe una tienda con ID {store_id}.", "ok": False}), 400

    if store_exists:
        # Aramamos la respuesta
        response = jsonify({
            "msg": f"Tienda {store_exists.nombre}",
            "ok": True,
            "data": store_exists.serialize()
        })
    return response, 200

# Store Get


@routes_store.route("/<int:store_id>", methods=["GET"])
@jwt_required()
def get_storedetail_for(store_id: int):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user_has_role(user, [ROLE_STORE]):
        return jsonify({"msg": "Usuario no autorizado", "ok": False}), 400

    store_exists = Store.query.filter_by(id=store_id, user_id=user.id).first()
    # Existencia de Store
    if not store_exists:
        return jsonify({"msg": f"No existe una tienda con ID {store_id}.", "ok": False}), 400

    if store_exists:
        # Aramamos la respuesta
        response = jsonify({
            "msg": f"Tienda {store_exists.nombre}",
            "ok": True,
            "data": store_exists.serialize()
        })
    return response, 200

    # Endpoint de actualizacion de Tienda


@routes_store.route('/<int:id>/update', methods=['PUT'])
@jwt_required()
@require_user_role([ROLE_STORE])
def update_store(id: int):
    user = g.user
    body = json.loads(request.data)
    name = body['nombre']
    address = body['direccion']
    description = body['description']
    # Se validan datos requeridos
    if name is None or address is None or address is None:
        return jsonify({"msg": f"Hay datos faltantes necesarios para poder actualizar la tienda.", "ok": False}), 400
    # Si ya existe la tienda damos error
    existing_store = Store.query.filter_by(id=id, user_id=user.id).first()
    if not existing_store:
        return jsonify({"msg": f"La tienda no existe.", "ok": False}), 400
    # Crear tienda
    existing_store.nombre = name,
    existing_store.description = description,
    existing_store.direccion = address
    try:
        db.session.commit()
        # Aramamos la respuesta
        response = jsonify({
            "msg": "Tienda actualizada con éxito",
            "ok": True,
            "data": existing_store.serialize()
        })
        return response, 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar tienda", "ok": False}), 500
