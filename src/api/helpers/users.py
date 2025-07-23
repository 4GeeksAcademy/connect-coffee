
# Helper para metodos de usuario
from api.models import User
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from api.constants import ROLE_ADMIN, ROLE_STORE, ROLE_USER


def user_has_role(user,role_list):

    # Consistencia en id de usuario
    if user.id is None or not isinstance(user.id,int):
        return False
    
    if user.role in role_list:
        return True
    
