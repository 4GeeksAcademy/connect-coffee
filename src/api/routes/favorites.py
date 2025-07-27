from sqlalchemy.exc import IntegrityError
from flask import Flask, request, jsonify, url_for, Blueprint,current_app,g
#from api.utils import generate_sitemap, APIException
from api.models import db, User, Store  
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,JWTManager
import json,yaml
from api.constants import ROLE_ADMIN,ROLE_USER, ROLE_STORE
from api.helpers.users import user_has_role,user_has_product,require_user_product,require_user_role


routes_favorite = Blueprint('favorites', __name__,url_prefix='/api/favorite')

# Allow CORS requests to this API
CORS(routes_favorite)



# Marcar la tienda de favorito
@routes_favorite.route('/', methods=['POST'])
@jwt_required()
@require_user_role([ROLE_USER])
def add_favorite():
    data = request.get_json()
    store_id = data.get('store_id')

    user = g.user
    store = Store.query.get(store_id)

    if not user or not store:
        return jsonify({'msg': 'Usuario o tienda no encontrada',"ok":False}), 404

    if store in user.favorite_stores:
        return jsonify({'msg': 'Ya tiene marcado a este favorito | {store.nombre} ',"ok":True}), 200

    user.favorite_stores.append(store)
    try:
        db.session.commit()
        return jsonify({'msg': f'{store.nombre} | Ahora ya es tu favorito!',"ok":True}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'msg': 'Error al agregar favorito',"ok":False}), 500


# Quitar la tienda de favorito
@routes_favorite.route('/', methods=['DELETE'])
@jwt_required()
@require_user_role([ROLE_USER])
def remove_favorite():
    data = request.get_json()
    store_id = data.get('store_id')

    user = g.user
    store = Store.query.get(store_id)

    if not user or not store:
        return jsonify({'msg': 'Usuario o tienda no encontrada',"ok":False}), 404

    if store not in user.favorite_stores:
        return jsonify({'msg': 'No estaba en favoritos',"ok":True}), 200

    user.favorite_stores.remove(store)
    db.session.commit()
    return jsonify({'msg': 'Tienda quitada de favoritos',"ok":True}), 200


# Obtener tiendas favoritas de un usuario
@routes_favorite.route('/me', methods=['GET'])
@routes_favorite.route('/user', methods=['GET'])
@jwt_required()
@require_user_role([ROLE_USER])
def get_user_favorites():
    user=g.user
    favorites = [{'id': store.id, 'name': store.nombre} for store in user.favorite_stores ]
    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Favoritos de {user.username}",
        "ok": True,
        "data": favorites
    })
    return response,200



# Obtener usuarios que marcaron como favorita una tienda
@routes_favorite.route('store/<int:store_id>', methods=['GET'])
@jwt_required()
@require_user_role([ROLE_STORE])
def get_store_favorited_by(store_id):
    store = Store.query.get(store_id) 

    if not store or not store.is_active:
        return jsonify({'msg': 'Tienda no encontrada',"ok":False}), 404

    users = [{'id': user.id, 'username': user.username} for user in store.favorited_by ]

    response=jsonify({
        "msg": f"Usuarios con marca de favorito en nuestra tienda {store.nombre}",
        "ok": True,
        "data": users
    })
    return response,200
