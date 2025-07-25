
# Helper para metodos de usuario
from api.models import User
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from api.constants import ROLE_ADMIN, ROLE_STORE, ROLE_USER
from api.models import Product,Menu,Store
# Decoradores
from functools import wraps
from flask import request, g #, jsonify 
from flask_jwt_extended import get_jwt_identity #inject_user_id (get_jwt_identit,g)

def user_has_role(user,role_list):

    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id,int):
        return False

    if user.role in role_list:
        return True
    
def user_has_product(user_id,product_id):
    existing_product = Product.query.filter_by(id=product_id).order_by(Product.id.desc()).first()
    if not existing_product:
        return False, f"No se pudo encontrar el producto", 400, None
    
    existing_menu=Menu.query.filter_by(id=existing_product.menu_id).first()
    if not existing_menu:
        return False, f"No se pudo encontrar el menu", 400, None
    
    existing_store=Store.query.filter_by( id=existing_menu.store_id).first()
    if not existing_store:
        return False, f"No se pudo encontrar la tienda", 400, None

    
    if existing_store.user_id != user_id:
        return False, f"El producto {product_id} no corresponde a su tienda {type(existing_store.user_id)}|{type(user_id)}", 403, None
    
    return True,"ok",200,existing_product
    
# Se quito e la logica de la ruta y no se usara mas porque pasamos a usar decoradores
# asi lo llamabamos
#   # Access the identity of the current user with get_jwt_identity
#     current_user_id = get_jwt_identity()
#     user = User.query.get(current_user_id)
#     if not user_has_role(user,[ROLE_STORE]):
#         return jsonify({"msg":"Usuario no autorizado","ok":False}),401 
    
#     ok, msg,status_code,product_exists = user_has_product(current_user_id, id)
#     if not ok:
#         return jsonify({"msg": msg, "ok": False}), status_code


# Decorador para validar pertenencia de producto
# @require_user_product("entity_id")
def require_user_product(param="product_id"):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            def force_int(value):
                try:
                    return int(value)
                except (TypeError, ValueError):
                    return None

            # Obtener product_id desde ruta, args o kwargs
            raw_product_id = kwargs.get(param)

            if raw_product_id is None:
                raw_product_id = request.view_args.get(param)

            if raw_product_id is None:
                raw_product_id = request.args.get(param)

            product_id = force_int(raw_product_id)
            user_id = force_int(get_jwt_identity())  # Obtengo user_id directo con JWT

            if product_id is None or user_id is None:
                return jsonify({"msg": "IDs inválidos", "ok": False}), 400

            # Validaciones en la DB
            product = Product.query.filter_by(id=product_id).order_by(Product.id.desc()).first()
            if not product:
                return jsonify({"msg": "No se pudo encontrar el producto", "ok": False}), 400

            menu = Menu.query.filter_by(id=product.menu_id).first()
            if not menu:
                return jsonify({"msg": "No se pudo encontrar el menú", "ok": False}), 400

            store = Store.query.filter_by(id=menu.store_id).first()
            if not store:
                return jsonify({"msg": "No se pudo encontrar la tienda", "ok": False}), 400

            if int(store.user_id) != user_id:
                return jsonify({
                    "msg": f"El producto {product_id} no corresponde a su tienda {store.user_id}|{user_id}",
                    "ok": False
                }), 403

            # Paso el producto al endpoint
            g.product = product

            return f(*args, **kwargs)
        return wrapper
    return decorator



# Se injecta antes del blueprint a todos los request el user_id
def inject_user_id():
    try:
        g.current_user_id = get_jwt_identity()
    except Exception:
        g.current_user_id = None



# Decorador para validar pertenencia de roles
# @require_user_role([ROLE_ADMIN,ROLE_STORE])
def require_user_role(allowed_roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            def force_int(value):
                try:
                    return int(value)
                except (TypeError, ValueError):
                    return None

            user_id = force_int(get_jwt_identity())
            if user_id is None:
                return jsonify({"msg": "ID de usuario inválido", "ok": False}), 401

            user = User.query.filter_by(id=user_id).first()
            if not user or user.role not in allowed_roles:
                return jsonify({"msg": "Usuario no autorizado", "ok": False}), 401

            g.user = user  # Lo pasamos al endpoint si lo querés usar
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Decorador para validar pertenencia de menu
# @require_user_menu("menu_id")
def require_user_menu(param):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            def force_int(value):
                try:
                    return int(value)
                except (TypeError, ValueError):
                    return None

                menu_id = force_int(request.view_args.get(param))
                user_id = force_int(get_jwt_identity())

                if menu_id is None or user_id is None:
                    return jsonify({"msg": "IDs inválidos", "ok": False}), 400

                menu = Menu.query.filter_by(id=menu_id).first()
                if not menu:
                    return jsonify({"msg": "Menú no encontrado", "ok": False}), 404

                store = Store.query.filter_by(id=menu.store_id).first()
                if not store or int(store.user_id) != user_id:
                    return jsonify({
                        "msg": f"Menú {menu_id} no pertenece a su tienda",
                        "ok": False
                    }), 403

            g.menu = menu
            return f(*args, **kwargs)
        return wrapper
    return decorator
