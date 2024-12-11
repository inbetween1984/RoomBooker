from django.contrib import admin
from rooms.models import Room, Equipment, Booking, Review

admin.site.register(Room)
admin.site.register(Equipment)
admin.site.register(Booking)
admin.site.register(Review)