from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from .models import Product, Cart, CartItem,Transaction
from .serializers import ProductSerializer, DetailedProductSerializer, CartItemSerializer, SimpleCartSerializer, CartSerializer, UserSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import uuid
from django.conf import settings
from decimal import Decimal
import requests
import paypalrestsdk
# Create your views here.

BASE_URL= "http://localhost:5173"

paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,  # "sandbox" or "live"
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})


@api_view(["GET"])
def products(request):
    products =Product.objects.all()
    serializer=ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def product_detail(request,slug):
    product=Product.objects.get(slug=slug)
    serializer=DetailedProductSerializer(product)
    return Response(serializer.data)

@api_view(["POST"])
def add_item(request):
    try:
        print("Request data:", request.data)  # Debugging: Log incoming data
        cart_code = request.data.get('cart_code')
        product_id = request.data.get('product_id')

        # Validate required fields
        if not cart_code:
            return Response({"error": "cart_code is required"}, status=400)
        if not product_id:
            return Response({"error": "product_id is required"}, status=400)

        cart, created = Cart.objects.get_or_create(cart_code=cart_code)
        product = Product.objects.get(id=product_id)
        cartitem, created = CartItem.objects.get_or_create(cart=cart, product=product)
        cartitem.quantity = 1
        cartitem.save()

        serializer = CartItemSerializer(cartitem)
        return Response({"data": serializer.data, "message": "Cartitem created successfully"}, status=201)
   
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
def product_in_cart(request):
    # Get the cart code and product ID from query parameters
    cart_code = request.query_params.get('cart_code')
    product_id = request.query_params.get('product_id')

    
    cart = Cart.objects.get(cart_code=cart_code)
    product = Product.objects.get(id=product_id)

    product_exists_in_cart = CartItem.objects.filter(cart=cart, product=product).exists()

    return Response({"product_in_cart": product_exists_in_cart})

@api_view(['GET'])
def get_cart_stat(request):
    cart_code = request.query_params.get("cart_code")
    cart = Cart.objects.get(cart_code=cart_code, paid=False)
    serializer = SimpleCartSerializer(cart)
    return Response(serializer.data)

@api_view(['GET'])
def get_cart(request):
    cart_code = request.query_params.get("cart_code")
    cart=  Cart.objects.get(cart_code=cart_code, paid=False)
    serializer= CartSerializer(cart)
    return Response(serializer.data)


@api_view(['PATCH'])
def update_quantity(request):
    try: 
        cartitem_id=request.data.get("item_id")
        quantity=request.data.get("quantity")
        quantity=int(quantity)
        cartitem=CartItem.objects.get(id=cartitem_id)
        cartitem.quantity=quantity
        cartitem.save()
        serializer= CartItemSerializer(cartitem)
        return Response({"data":serializer.data, "message": "Cartitem updated successfully"})
    

    except Exception as e:
        return Response({'error':str(e)}, status=400)
    

@api_view(['POST'])
def delete_cartitem(request):
    cartitem_id = request.data.get("item_id")
    cartitem = CartItem.objects.get(id=cartitem_id)
    cartitem.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_username(request):
    user=request.user
    return Response({"Username": user.username})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user=request.user
    serializer=UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    if request.user:
        try:
            # Generate a unique transaction reference
            tx_ref = str(uuid.uuid4())
            cart_code = request.data.get("cart_code")
            cart = Cart.objects.get(cart_code=cart_code)
            user = request.user

            amount = sum([item.quantity * item.product.price for item in cart.items.all()])
            tax = Decimal("4.00")
            total_amount=amount+tax
            currency="INR"
            redirect_url= f"{BASE_URL}/payment-status/"

            transaction = Transaction.objects.create(
                ref=tx_ref,
                cart=cart,
                amount=total_amount,
                currency=currency,
                user=user,
                status='pending'
            )

            flutterwave_payload = {
                "tx_ref": tx_ref,
                "amount": str(total_amount),  # Convert to string
                "currency": currency,
                "redirect_url": redirect_url,
                "customer": {
                    "email": user.email,
                    "name": user.username,
                    "phonenumber": user.phone
                },
                "customizations": {
                    "title": "Grabsy Payment"
                }
            }

            # Set up the headers for the request
            headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json"
            }
            response = requests.post(
                "https://api.flutterwave.com/v3/payments",
                json=flutterwave_payload,
                headers=headers
)
            if response.status_code==200:
                return Response(response.json(),status=status.HTTP_200_OK)
            else:
                return Response(response.json(),status=response.status_code)


        except Exception as e:
            return Response({"error": str(e)}, status=400)


@api_view(['POST'])
def payment_callback(request):
    status = request.GET.get('status')
    tx_ref = request.GET.get('tx_ref')
    transaction_id = request.GET.get('transaction_id')

    user = request.user

    if status == 'successful':
        # Verify the transaction using Flutterwave's API
        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
        }

        response = requests.get(f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify", headers=headers)
        response_data = response.json()

        if response_data['status'] == 'success':
            transaction = Transaction.objects.get(ref=tx_ref)

            # Confirm the transaction details
            if (response_data['data']['status'] == "successful" 
                and float(response_data['data']['amount']) == float(transaction.amount) 
                and response_data['data']['currency'] == transaction.currency):

                # Update transaction and cart status to paid
                transaction.status = 'completed'
                transaction.save()

                cart = transaction.cart
                cart.paid = True
                cart.user = user
                cart.save()

                return Response({'message': 'Payment successful!', 'subMessage': 'You have successfully made payment.'})
            else:
                return Response({'message': 'Payment verification failed.', 'subMessage': 'Your payment verification failed.'})
        else:
            return Response({'message': 'Failed to verify transaction with Flutterwave.', 'subMessage': 'We could not verify the transaction.'}, status=400)
    
    else:
        # Payment was not successful
        return Response({'message': 'Payment was not successful.'}, status=400)


from decimal import Decimal
import uuid

@api_view(['POST'])
def initiate_paypal_payment(request):
    if request.method == 'POST' and request.user.is_authenticated:
        # Fetch the cart and calculate total amount
        tx_ref = str(uuid.uuid4())
        user = request.user
        cart_code = request.data.get("cart_code")
        cart = Cart.objects.get(cart_code=cart_code)
        amount = sum(item.product.price * item.quantity for item in cart.items.all())
        tax = Decimal("4.00")
        total_amount = amount + tax

        # Create a PayPal payment object
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{BASE_URL}/payment-status?paymentStatus=success&ref={tx_ref}",
                "cancel_url": f"{BASE_URL}/payment-status?paymentStatus=cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Cart Items",
                        "sku": "cart",
                        "price": str(total_amount),
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "total": str(total_amount),
                    "currency": "USD"
                },
                "description": "Payment for cart items."
            }]
        })

        print("pay_id", payment)

        transaction, created = Transaction.objects.get_or_create(
            ref=tx_ref,
            cart=cart,
            amount=total_amount,
            user=user,
            status='pending'
        )

        if payment.create():
            # Extract PayPal approval URL to redirect the user
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = str(link.href)
                    return Response({"approval_url": approval_url})
        else:
            return Response({"error": payment.error}, status=400)
        
@api_view(['POST'])
def paypal_payment_callback(request):
    payment_id = request.query_params.get('paymentId')
    payer_id = request.query_params.get('PayerID')
    ref = request.query_params.get('ref')
    
    user = request.user
    
    print("refff", ref)
    
    transaction = Transaction.objects.get(ref=ref)
    
    if payment_id and payer_id:
        # Fetch payment object using PayPal SDK
        payment = paypalrestsdk.Payment.find(payment_id)
        
        transaction.status = 'completed'
        transaction.save()
        
        cart = transaction.cart
        cart.paid = True
        cart.user = user
        cart.save()
        
        return Response({
            'message': 'Payment successful!',
            'subMessage': 'You have successfully made payment for the items you purchased 🎉'
        })
    
    else:
        return Response({"error": "Invalid payment details."}, status=400)
