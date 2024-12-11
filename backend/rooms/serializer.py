from rest_framework import serializers
from .models import Room, Equipment, Booking


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name']

class RoomSerializer(serializers.ModelSerializer):
    equipment = serializers.StringRelatedField(many=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

class BookingSerializer(serializers.ModelSerializer):
    room = RoomSerializer()

    class Meta:
        model = Booking
        fields = '__all__'
