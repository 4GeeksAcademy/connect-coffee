"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint,current_app,g
from api.models import db, User, Store,Product,Image,UserPoint,Menu,Category
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token,JWTManager
import json,yaml
from api.constants import ROLE_ADMIN,ROLE_STORE
from api.helpers.users import user_has_role,user_has_product,require_user_product,require_user_role
from sqlalchemy.orm import joinedload

routes_product = Blueprint('products', __name__,url_prefix='/api/product')

# Allow CORS requests to this API
CORS(routes_product)

## PRODUCTOS ##

# Endpoint de creacion de Producto
@routes_product.route('/create', methods=['POST'])
@jwt_required()
@require_user_role([ROLE_STORE])
def add_product():
    user = g.user
    
    body=json.loads(request.data)
    menu_id=body['menu_id']
    name=body['name']
    description=body['description']
    category=body['category']
    price=body['price']


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

# Endpoint de actualizacion de Producto
@routes_product.route('/<int:id>/update', methods=['PUT'])
@jwt_required()
@require_user_role([ROLE_STORE])
@require_user_product("id")
def update_product(id:int):
    user = g.user
    product= g.product
    
    body=json.loads(request.data)
    menu_id=body['menu_id']
    name=body['name']
    description=body['description']
    category=body['category']
    price=body['price']


    # Se validan datos requeridos
    if name is None or description is None or menu_id is None:
        return jsonify({"msg":f"Hay datos faltantes necesarios para poder crear el producto.","ok":False}),400
    
    if price and price < 0:
        return jsonify({"msg":f"Ingrese un precio valido mayor que 0.","ok":False}),400
    
    # Se valida existencia de menu 
    existing_menu = Menu.query.filter_by(id=menu_id).first()
    if not existing_menu:
        return jsonify({"msg":f"No existe el menu {menu_id}.","ok":False}),400
        
    # # Si ya existe el producto damos error
    # existing_product = Product.query.filter_by(menu_id=menu_id,name=name,category=category).first()
    # if (existing_product):
    #     return jsonify({"msg":f"Ya existe un producto {name} para el menu {menu_id}.","ok":False}),400

    # Crear producto
    product.menu_id=menu_id,
    product.name=name,
    product.description=description,
    product.price=price,
    product.category=category

    try:
        db.session.commit()
        # Aramamos la respuesta
        response=jsonify({
            "msg": "Producto creado con éxito",
            "ok": True,
            "data": product.serialize()
        })
        return response,200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar producto", "ok": False}), 500



@routes_product.route('/list', methods=['GET'])
@jwt_required()
@require_user_role([ROLE_STORE])
def products_list():
    user = g.user

    products = (
        Product.query
        .join(Menu)
        .join(Store)
        .options(joinedload(Product.menu).joinedload(Menu.store))
        .filter(Store.user_id == user.id)
        .all()
    )

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Listado de productos para {user.username}",
        "ok": True,
        "data": [product.serialize() for product in products]
    })
    return response,200

# Product Delete 
@routes_product.route("/<int:id>", methods=["DELETE"])
@jwt_required()
@require_user_role([ROLE_STORE])
@require_user_product("id")
def delete_product_for(id: int):         
    product = g.product
    if product.is_active == True:
            return jsonify({"msg":f"No existe una producto inactivo con ID {id}. Verifique si el producto que intenta eliminar exista y se encuentre inactivo","ok":False}) , 400
    
    db.session.delete(product)
    db.session.commit()
    return jsonify({"msg":"Producto eliminado con exito","ok":True}),200



# Product Get 
@routes_product.route("/<int:product_id>", methods=["GET"])
@jwt_required()
@require_user_role([ROLE_STORE])
@require_user_product("product_id")
def get_product( product_id: int):
    product = g.product
    #user=g.user
    response=jsonify({
        "msg": "Producto obtenido con exito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200


# Product Deactivate
@routes_product.route("/<int:id>/deactivate", methods=["PATCH"])
@jwt_required()
@require_user_role([ROLE_STORE])
@require_user_product("id")
def deactivate_product_for(id: int):
    user = g.user
    product=g.product
    if product.is_active == False:
        return jsonify({"msg":f"No existe un producto inactivo con ID {id}. Verifique si el producto que intenta eliminar exista y se encuentre inactivo","ok":False}) , 400
    
    # Si llego aca el producto existe, esta activo, le pertenece
   
    product.is_active=False
    db.session.add(product)
    db.session.commit()

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Producto {product.name} deshabilitado con exito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200

# Product Activate
@routes_product.route("/<int:id>/activate", methods=["PATCH"])
@jwt_required()
@require_user_role([ROLE_STORE])
@require_user_product("id")
def activate_product_for(id: int):
    user = g.user
    product = g.product
    if product.is_active:
            return jsonify({"msg":f"No existe un producto con ID {id} o ya se encuentra activo","ok":False}) , 400
    
    product.is_active=True
    db.session.add(product)
    db.session.commit()

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Producto {product.name} habilitado con exito",
        "ok": True,
        "data": product.serialize()
    })
    return response,200

#####################
## Admin Endpoints ##
#####################

# Product Deactivate
@routes_product.route("/admin/<int:id>/deactivate", methods=["PATCH"])
@jwt_required()
@require_user_role([ROLE_ADMIN])
def admin_deactivate_product_for(id: int):
    user = g.user
 
    product_exists=Product.query.filter_by(id=id,is_active=True).first()
    if not product_exists:
            return jsonify({"msg":f"No existe un producto activo con ID {id}.","ok":False}) , 400
    
    product_exists.is_active=False
    #db.session.add(product_exists)
    db.session.commit()

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Producto {product_exists.name} deshabilitado con exito",
        "ok": True,
        "data": product_exists.serialize()
    })
    return response,200

# Product Activate
@routes_product.route("/admin/<int:id>/activate", methods=["PATCH"])
@jwt_required()
@require_user_role([ROLE_ADMIN])
def admin_activate_product_for(id: int):
    user = g.user

    product_exists=Product.query.filter_by(id=id,is_active=False).first()
    if not product_exists:
            return jsonify({"msg":f"No existe un producto con ID {id} o ya se encuentra activo","ok":False}) , 400
    
    product_exists.is_active=True
   # db.session.add(product_exists)
    db.session.commit()

    # Aramamos la respuesta
    response=jsonify({
        "msg": f"Producto {product_exists.name} habilitado con exito",
        "ok": True,
        "data": product_exists.serialize()
    })
    return response,200


# Endpoint de creacion de Producto
@routes_product.route('/admin/create', methods=['POST'])
@jwt_required()
@require_user_role([ROLE_ADMIN])
def add_product_admin():
    body=json.loads(request.data)
    menu_id=body['menu_id']
    name=body['name']
    description=body['description']
    category=body['category']
    price=body['price']

    user = g.user
   

    # Crear producto
    product = Product(
        name=name,
        menu_id=menu_id,
        description=description,
        categoryl=category,
        price=price,
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

# Product Delete 
@routes_product.route("/admin/<int:id>", methods=["DELETE"])
@jwt_required()
@require_user_role([ROLE_ADMIN])
def admin_delete_product_for(id: int):
    user = g.user
    
    product_exists=Product.query.filter_by(id=id,is_active=False).first()
    if not product_exists:
            return jsonify({"msg":f"No existe una producto inactivo con ID {id}. Verifique si el producto que intenta eliminar exista y se encuentre inactivo","ok":False}) , 400
    
    db.session.delete(product_exists)
    db.session.commit()
    return jsonify({"msg":"Producto eliminada con exito","ok":True}),200

# Endpoint ADMIN de listado de productos
@routes_product.route('/admin/list', methods=['GET'])
@jwt_required()
@require_user_role([ROLE_ADMIN])
def products_list_admin():
    products = Product.query.all()
    # Aramamos la respuesta
    response=jsonify({
        "msg": "Listado de productos",
        "ok": True,
        "data": [product.serialize() for product in products]
    })
    return response,200


# Endpoint de actualizacion de Producto
@routes_product.route('/admin/<int:id>/update', methods=['PUT'])
@jwt_required()
@require_user_role([ROLE_ADMIN])

def admin_update_product(id:int):
    user = g.user
    
    body=json.loads(request.data)
    menu_id=body['menu_id']
    name=body['name']
    description=body['description']
    category=body['category']
    price=body['price']


    # Se validan datos requeridos
    if name is None or description is None or menu_id is None:
        return jsonify({"msg":f"Hay datos faltantes necesarios para poder crear el producto.","ok":False}),400
    
    if price and price < 0:
        return jsonify({"msg":f"Ingrese un precio valido mayor que 0.","ok":False}),400
    
    # Se valida existencia de menu 
    existing_menu = Menu.query.filter_by(id=menu_id).first()
    if not existing_menu:
        return jsonify({"msg":f"No existe el menu {menu_id}.","ok":False}),400
        
    # # Si ya existe el producto damos error
    existing_product = Product.query.filter_by(id=id).first()
    if (not existing_product):
         return jsonify({"msg":f"No existe un producto {name} para el menu {menu_id}.","ok":False}),400

    # Crear producto
    existing_product.menu_id=menu_id,
    existing_product.name=name,
    existing_product.description=description,
    existing_product.price=price,
    existing_product.category=category

    try:
        db.session.commit()
        # Aramamos la respuesta
        response=jsonify({
            "msg": "Producto creado con éxito",
            "ok": True,
            "data": existing_product.serialize()
        })
        return response,200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar producto", "ok": False}), 500
