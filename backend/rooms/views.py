import logging
from datetime import date

from django.contrib.auth import authenticate
from django.db.models import Count, Q
from rest_framework import status, serializers
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from rooms.models import Room, Booking, Equipment, Review
from rooms.serializer import RoomSerializer, BookingSerializer, EquipmentSerializer, ReviewSerializer

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        if user is None:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username
        }

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
def room_list(request):
    if request.method == 'GET':
        capacity_from = request.query_params.get('capacity_from')
        capacity_to = request.query_params.get('capacity_to')
        equipment_ids = request.query_params.getlist('equipment')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        rooms = Room.objects.all()

        if capacity_from:
            rooms = rooms.filter(capacity__gte=int(capacity_from))
        if capacity_to:
            rooms = rooms.filter(capacity__lte=int(capacity_to))

        if equipment_ids:
            rooms = rooms.annotate(
                matched_equipment=Count('equipment', filter=Q(equipment__in=equipment_ids))
            ).filter(matched_equipment=len(equipment_ids))

        if date_from or date_to:
            bookings = Booking.objects.filter(approved=True)
            if date_from and date_to:
                bookings = bookings.filter(date__range=(date_from, date_to))
            elif date_from:
                bookings = bookings.filter(date__gte=date_from)
            elif date_to:
                bookings = bookings.filter(date__lte=date_to)

            booked_room_ids = bookings.values_list('room_id', flat=True)
            rooms = rooms.exclude(id__in=booked_room_ids)

        serializer = RoomSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def room_detail(request, room_id):
    try:
        room = Room.objects.get(pk=room_id)
        bookings = Booking.objects.filter(room=room, approved=True, date__gte=date.today())
        booking_dates = [booking.date for booking in bookings]

        room_data = RoomSerializer(room, context={'request': request}).data

        return Response({
            "room": room_data,
            "booked_dates": booking_dates
        }, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def reviews_list(request, room_id):
    reviews = Review.objects.filter(room_id=room_id).select_related('user')

    if not reviews.exists():
        return Response({"reviews": []}, status=status.HTTP_200_OK)

    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request, room_id):
    print(request.data)
    try:
        room = Room.objects.get(pk=room_id)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

    if not Booking.objects.filter(
        room=room, approved=True, date__lte=date.today(), user=request.user
    ).exists():
        return Response({"error": "You need book this room to create review"}, status=status.HTTP_404_NOT_FOUND)

    if Review.objects.filter(room=room, user=request.user).exists():
        return Response({"error": "You have already reviewed"}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, room=room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    print("Serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_room(request, room_id):
    try:
        room = Room.objects.get(pk=room_id)
        booking_date = request.data.get("date")

        if not booking_date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)

        booking_date = date.fromisoformat(booking_date)

        if booking_date < date.today():
            return Response({"error": "Cannot book for past dates"}, status=status.HTTP_400_BAD_REQUEST)

        if Booking.objects.filter(room=room, date=booking_date, approved=True).exists():
            return Response({"error": "This date is already booked"}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.create(room=room, user=request.user, date=booking_date, approved=False)

        return Response(
            {
                "message": "Booking request submitted",
                "id": booking.id
            },
            status=status.HTTP_201_CREATED
        )
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_list(request):
    bookings = Booking.objects.filter(user=request.user)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    booking = Booking.objects.filter(id=booking_id, user=request.user)
    booking.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def equipment_list(request):
    equipment = Equipment.objects.all()
    serializer = EquipmentSerializer(equipment, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

