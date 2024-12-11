from django.shortcuts import get_object_or_404
from rest_framework import status as rest_framework_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from backend import settings
from payments.models import Payment
from rooms.models import Booking
from yookassa import Payment as YooKassaPayment
import json
from yookassa import Configuration


Configuration.account_id = settings.YOOKASSA_SHOP_ID
Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

@csrf_exempt
@api_view(['POST'])
def payment_webhook(request):
    data = json.loads(request.body)
    transaction_id = data.get('object', {}).get('id')
    status = data.get('object', {}).get('status')

    try:
        payment = Payment.objects.get(transaction_id=transaction_id)

        if status == 'succeeded':
            payment.status = 'paid'
            payment.save()

            booking = payment.booking
            booking.approved = True
            booking.save()

        elif status == 'canceled':
            payment.status = 'failed'
            payment.save()

        return Response({"status": "ok"})

    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request, booking_id):
    try:
        booking = get_object_or_404(Booking, pk=booking_id, user=request.user)

        if booking.approved:
            return Response({"error": "Booking already confirmed"}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

        if Payment.objects.filter(booking=booking).exists():
            return Response({"error": "Payment already exists for this booking"}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            booking=booking,
            amount=booking.room.price_per_day,
            status='pending'
        )

        payment_data = {
            "amount": {
                "value": f"{payment.amount:.2f}",
                "currency": "RUB"
            },
            "confirmation": {
                "type": "redirect",
                "return_url": f"http://localhost:3000/payment/success/?payment_id={payment.id}",
            },
            "capture": True,
            "description": f"Payment for booking {booking.id}"
        }

        try:
            yoo_payment = YooKassaPayment.create(payment_data)
        except Exception as e:
            return Response({"error": str(e)}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

        payment.transaction_id = yoo_payment.id
        payment.save()

        return Response({"payment_url": yoo_payment.confirmation.confirmation_url}, status=rest_framework_status.HTTP_200_OK)

    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=rest_framework_status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def check_payment_status(request):
    payment_id = request.data.get('payment_id')

    if not payment_id:
        return Response({"error": "Payment ID is required"}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

    try:
        payment = Payment.objects.get(id=payment_id)
        status = payment.status

        if status == 'paid':
            booking = payment.booking
            booking.approved = True
            booking.save()
            return Response({"message": "Payment succeeded and booking approved."})

        elif status == 'pending':
            return Response({"message": "Payment is still pending."}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

        elif status == 'failed':
            return Response({"message": "Payment failed."}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"message": f"Unknown payment status: {status}"}, status=rest_framework_status.HTTP_400_BAD_REQUEST)

    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=rest_framework_status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, transaction_id):
    try:
        payment = Payment.objects.get(transaction_id=transaction_id, booking__user=request.user)

        return Response({"status": payment.status}, status=rest_framework_status.HTTP_200_OK)

    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=rest_framework_status.HTTP_404_NOT_FOUND)
