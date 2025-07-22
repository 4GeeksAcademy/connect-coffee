import stripe,os
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS


stripe.api_key = os.getenv("STRIPE_API_PRIVKEY")  # ⚠️ Tu clave secreta de Stripe


routes_donation = Blueprint('donations', __name__,url_prefix='/api/donation')

# Allow CORS requests to this API
CORS(routes_donation)

@routes_donation.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    amount = int(float(data['amount']) * 100)  # Stripe trabaja en centavos

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': amount,
                    'product_data': {
                        'name': 'Donación a CoffeeConnect',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=os.getenv("FRONTEND_URL")+'/success',
            cancel_url=os.getenv("FRONTEND_URL")+'/cancel',
        )
        return jsonify({'id': session.id})
    except Exception as e:
        return jsonify(error=str(e)), 400