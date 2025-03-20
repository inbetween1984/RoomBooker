from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework_simplejwt.views import TokenRefreshView

import payments.views
import rooms.views
from backend import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/login/', rooms.views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    re_path(r'^api/rooms/$', rooms.views.room_list),

    re_path(r'^api/register/$', rooms.views.register_user, name='register_user'),

    re_path(r'^api/bookings/$', rooms.views.booking_list, name='booking_list'),

    path('api/cancel_book/<int:booking_id>/', rooms.views.cancel_booking, name='cancel_book'),
    path('api/rooms/<int:room_id>/', rooms.views.room_detail, name='room_detail'),
    path('api/rooms/<int:room_id>/reviews', rooms.views.reviews_list, name='room_reviews'),
    path('api/rooms/<int:room_id>/create_review/', rooms.views.create_review, name='create_review'),

    re_path(r'^api/equipments/$', rooms.views.equipment_list, name='equipment_list'),

    path('api/rooms/<int:room_id>/book/', rooms.views.book_room, name='book_room'),
    path('api/', include('payments.urls')),
    path('payment/webhook/', payments.views.payment_webhook, name='payment_webhook'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
