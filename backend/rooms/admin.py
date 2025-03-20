from django.contrib import admin
from rooms.models import Room, Equipment, Booking, Review
from .forms import RoomAdminForm

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    form = RoomAdminForm
    list_display = ('name', 'address', 'latitude', 'longitude', 'capacity')

admin.site.register(Equipment)
admin.site.register(Booking)
admin.site.register(Review)

