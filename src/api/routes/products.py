"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint,current_app
from api.models import db, User, Store,Product,Image,UserPoint,Menu,Category
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,JWTManager
import json,yaml
from api.constants import ROLE_ADMIN,ROLE_STORE
from api.helpers.users import user_has_role

routes_product = Blueprint('products', __name__,url_prefix='/api/product')

# Allow CORS requests to this API
CORS(routes_product)

## PRODUCTOS ##
# Endpoint de creacion de Producto
@routes_product.route('/create', methods=['POST'])
@jwt_required()
def add_product():
    body=json.loads(request.data)
    menu_id=body['menu_id']
    name=body['name']
    description=body['description']
    category=body['category']
    price=body['price']

    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id) 
    
    # Se validan datos requeridos
    if name is None or description is None or menu_id is None:
        return jsonify({"msg":f"Hay datos faltantes necesarios para poder crear el producto.","ok":False}),400
    if price and price < 0:
        return jsonify({"msg":f"Ingrese un precio valido mayor que 0.","ok":False}),400
    
    # Se valida existencia de menu 
    existing_menu = Menu.query.filter_by(id=menu_id).first()
    if not existing_menu:
        return jsonify({"msg":f"No existe el menu {menu_id}.","ok":False}),400
        
    # Si ya existe el producto damos error
    existing_product = Product.query.filter_by(menu_id=menu_id,name=name,category=category).first()
    if existing_product:
        return jsonify({"msg":f"Ya existe un producto {name} para el menu {menu_id}.","ok":False}),400

    # Crear producto
    product = Product(
        menu_id=menu_id,
        name=name,
        description=description,
        price=price,
        category=category
    )

    db.session.add(product)
    db.session.commit()

    # Aramamos la respuesta
    response=jsonify({
        "msg": "Producto creado con éxito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200

@routes_product.route('/list', methods=['GET'])
@jwt_required()
def products_list():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    products=Product.query.filter_by(user_id=user.id).all()

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Listado de productos para {user.username}",
        "ok": True,
        "data": [product.serialize() for product in products]
    })
    return response,200

## PRODUCTOS ## ADMIN ##
# Endpoint ADMIN de listado de productos
@routes_product.route('/admin/list', methods=['GET'])
@jwt_required()
def products_list_admin():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_ADMIN:
        return jsonify({"msg": "Usuario no autorizado","ok": False}),401
    
    products = Product.query.all()
    # Aramamos la respuesta
    response=jsonify({
        "msg": "Listado de productos",
        "ok": True,
        "data": [product.serialize() for product in products]
    })
    return response,200



# Endpoint de creacion de Producto
@routes_product.route('/admin/create', methods=['POST'])
@jwt_required()
def add_product_admin():
    body=json.loads(request.data)
    owner_type=body['owner_type'] # Store, User, Product
    owner_id=body['owner_id']
    name=body['name']
    prd_type=body['prd_type']
    url=body['url']
    position=body['position']

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_ADMIN:
        return jsonify({"msg": "Usuario no autorizado","ok": False}),401
    
    if not body or "user_id" not in body:
        return jsonify({"msg":f"Es necesario definir el user_id que sera propietario del producto que se creara", "ok":False}),400

    
    user_id=body['user_id']
    
    # Validar tipo de entidad
    valid_types = ['store', 'product', 'user', 'menu']
    if owner_type not in valid_types:
        return jsonify({"msg":f"Tipo no válido. Debe ser uno de: {valid_types}","ok":False }),400
    
    
    # Validar que el objeto exista antes de asignarlo
    model_map = {
        'store': Store,
        'product': Product,
        'user': User,
        'menu': Menu
    }
    # Validar que el objeto relacionado exista antes de asignarlo
    entity_model = model_map.get(owner_type)
    if not db.session.get(entity_model, owner_id):
        return jsonify({"msg":f"{owner_type.capitalize()} con ID {owner_id} no existe.","ok":False}),400

    
    # solo aceptamos una producto index
    if prd_type == 'index':
        existing_index = Product.query.filter_by(owner_type=owner_type,owner_id=owner_id,type='index').first()
        if existing_index:
            return jsonify({"msg":f"Ya existe una producto de tipo 'index' para {owner_type} con ID {owner_id}.","ok":False}),400

    # Crear producto
    product = Product(
        owner_type=owner_type,
        owner_id=owner_id,
        name=name,
        type=prd_type,
        url=url,
        position=position,
        user_id=user_id
    )

    db.session.add(product)
    db.session.commit()
    # Aramamos la respuesta
    response=jsonify({
        "msg": "Producto creada con éxito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200






#### SEGUIR DE ACA

# Product Get 
@routes_product.route("/<int:entity_id>", methods=["GET"])
@jwt_required()
def get_product( entity_id: int):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user_has_role(user,[ROLE_STORE]):
        return jsonify({"msg":"Usuario no autorizado","ok":False}),400 
    
    
    product=Product.query.filter_by( id=entity_id).first()
    if not product:
        return jsonify({"msg":f"No se pudo encontrar el producto","ok":False}),400
    existing_menu=Menu.query.filter_by( id=product.menu_id).first()
    if not existing_menu:
        return jsonify({"msg":f"No se pudo encontrar el menu","ok":False}),400
    existing_store=Store.query.filter_by( id=existing_menu.store_id).first()
    if not existing_store:
        return jsonify({"msg":f"No se pudo encontrar la tienda","ok":False}),400
    
    if not existing_store.user_id == user.id:
        return jsonify({"msg":f"El producto no existe o no le pertenece","ok":False}),400

    response=jsonify({
        "msg": "Producto obtenido con exito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200

# Product Delete 
@routes_product.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_product_for(id: int):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != ROLE_STORE and user.role != ROLE_ADMIN :
        return jsonify({"msg": "Usuario no autorizado","ok": False}),401

    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id,int):
        return jsonify({"msg":f"No se pudo identificar el usuario","ok":False}),400
    
    product_exists=Product.query.filter_by(id=id).first()
    if not product_exists:
            return jsonify({"msg":f"No existe una producto con ID {id}.","ok":False}) , 400
    
    db.session.delete(product_exists)
    db.session.commit()
    return jsonify({"msg":"Producto eliminada con exito","ok":True}),200

    


