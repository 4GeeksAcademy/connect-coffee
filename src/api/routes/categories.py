"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, current_app
from api.models import db, User, Store, Category
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import yaml
from api.constants import ROLE_ADMIN, ROLE_USER, ROLE_STORE

routes_category = Blueprint('categories', __name__,
                            url_prefix='/api/category')

# Allow CORS requests to this API
CORS(routes_category)

## CATEGORIES ##
# Endpoint de creacion de Category


@routes_category.route('/add', methods=['POST'])
@routes_category.route('/create', methods=['POST'])
@jwt_required()
def add_category():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id, int):
        return jsonify({"msg": f"No se pudo identificar el usuario", "ok": False}), 400

    # Solo Role Admin
    if user.role != ROLE_ADMIN:
        return jsonify({"msg": f"Usuario no autorizado | {user.role}", "ok": False}), 401
    user_id = user.id

    # Datos enviados por api
    data = request.get_json()

    # Minimos requermimientos en la estructura del body del endpoint
    if "name" not in data or "description" not in data:
        return jsonify({"msg": "No se alcanzaron los requerimientos para agregar la categoria. Debe especificar name y description.", "ok": False}), 400
    name = data.get("name")
    description = data.get("description")  # Texto explicativo de la categoria

    # Validacion de consistencia de descripcion: no vacia y con un minimos 10 caracteres
    if description and description is None and len(description) < 10:
        return jsonify({"msg": f"Debe ingresar una descripción de al menos 10 caracteres.", "ok": False}), 400

     # Se valida existencia de Category del usuario
    existing_category = Category.query.filter_by(name=name).first()
    if existing_category:
        return jsonify({"msg": f"Ya existe una categoria con el nombre {name} .", "ok": False}), 409

    # Crear category
    category = Category(
        name=name,
        description=description
    )
    db.session.add(category)
    db.session.commit()

    # Aramamos la respuesta
    response = jsonify({
        "msg": "Categoria creada con éxito",
        "ok": True,
        "data": category.serialize()
    })
    return response, 200


@routes_category.route('/list', methods=['GET'])
@jwt_required()
def categories_list():
    # if not existing_store:
    categories = Category.query.all()

    # Aramamos la respuesta
    response = jsonify({
        "msg": "Listado de Categorias",
        "ok": True,
        "data": [category.serialize() for category in categories]
    })
    return response, 200


# Endpoint de asociacion de Category
@routes_category.route('/<int:store_id>/set', methods=['POST'])
@jwt_required()
def set_category(store_id):
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id, int):
        return jsonify({"msg": f"No se pudo identificar el usuario", "ok": False}), 400

    # Solo Role Admin
    if user.role != ROLE_ADMIN and user.role != ROLE_STORE:
        return jsonify({"msg": f"Usuario no autorizado | {user.role}", "ok": False}), 401
    user_id = user.id

    # Datos enviados por api
    data = request.get_json()

    # Minimos requermimientos en la estructura del body del endpoint
    if "category_ids" not in data:
        return jsonify({"msg": "No se alcanzaron los requerimientos para agregar la categoria. Debe especificar name y description.", "ok": False}), 400
    category_ids = data.get("category_ids")

    # Validacion de consistencia de descripcion: no vacia y con un minimos 10 caracteres
    if not category_ids or category_ids is None or not isinstance(category_ids, list):
        return jsonify({"msg": f"Debe ingresar un listado de categorias [1,2,n].", "ok": False}), 400

    existing_store = Store.query.get(store_id)
    if not existing_store:
        return jsonify({"error": "La tienda no existe"}), 404
     # Se valida existencia de Category del usuario
    added = []
    skipped = []
   # IDs ya asociados al store
    existing_ids = {c.id for c in existing_store.categories}

    for cat_id in category_ids:
        category = Category.query.get(cat_id)
        if not category:
            skipped.append({"id": cat_id, "reason": "Categoria no encontrada"})
            continue

        # Verificamos si ya está asociada por ID
        if cat_id in existing_ids:
            skipped.append({"id": cat_id, "reason": "Already associated"})
            continue

        existing_store.categories.append(category)
        added.append(cat_id)

    db.session.commit()

    # Aramamos la respuesta
    response = jsonify({
        "msg": f"Se preocesaron las categorias {len(category_ids)} con éxito",
        "ok": True,
        "added": added,
        "skipped": skipped,
        "store_id": store_id
    })
    return response, 200


#  SEGUIR ACA

## CATEGORIES ## ADMIN ##
# Endpoint ADMIN de listado de Puntos de Usuario
# @routes_category.route('/admin/list', methods=['GET'])
# @jwt_required()
# def categories_list_admin():
#     # Access the identity of the current user with get_jwt_identity
#     current_user_id = get_jwt_identity()
#     user = User.query.get(current_user_id)

#     if user.role != ROLE_ADMIN:
#         return jsonify({"msg": "Usuario no autorizado","ok": False}),401

#     categories = Category.query.all()
#     # Aramamos la respuesta
#     response=jsonify({
#         "msg": "Listado de Puntos de Usuario",
#         "ok": True,
#         "data": [category.serialize() for category in categories]
#     })
#     return response,200


# # Category Get
# @routes_category.route("/<string:entity_type>/<int:entity_id>", methods=["GET"])
# @jwt_required()
# def get_categories_for(entity_type: str, entity_id: int):
#     category=Category.query.filter_by(owner_type=entity_type, owner_id=entity_id).all()
#     if category:
#         return jsonify(category.serialize())

# # Category Delete
# @routes_category.route("/<int:id>", methods=["DELETE"])
# @jwt_required()
# def delete_category_for(id: int):
#     category_exists=Category.query.filter_by(id=id).first()
#     if not category_exists:
#             return jsonify({"msg":f"No existe una category con ID {id}.","ok":False}) , 400

#     db.session.delete(category_exists)
#     db.session.commit()
#     return jsonify({"msg":"Category eliminada con exito","ok":True}),200
