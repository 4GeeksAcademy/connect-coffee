"""
Decorador para validar API Key en endpoints públicos
Similar a los decoradores en api/helpers/users.py
"""
from functools import wraps
from flask import request, jsonify


def require_api_key(f):
    """
    Decorador que valida la presencia y validez de la API key
    en el header 'x-api-key' para endpoints públicos

    Uso: @require_api_key
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Obtener API key del header
        api_key = request.headers.get('x-api-key')

        # API key esperada (debería estar en variables de entorno en producción)
        expected_key = "2136348ff926fcefd12680594f9ee1b413add849a6d437afac9f2b20d109dee9"

        # Validar presencia y valor de la API key
        if not api_key:
            return jsonify({
                "msg": "API key requerida. Incluye 'x-api-key' en los headers.",
                "ok": False
            }), 401

        if api_key != expected_key:
            return jsonify({
                "msg": "API key inválida",
                "ok": False
            }), 401

        # Si la validación pasa, ejecutar la función original
        return f(*args, **kwargs)

    return decorated_function
