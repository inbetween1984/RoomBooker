from django.urls import path
from . import views

urlpatterns = [
    path('payment/create/<int:booking_id>/', views.create_payment, name='create_payment'),
    # path('payment/webhook/', views.payment_webhook, name='payment_webhook'),
    path('payment/status/<str:transaction_id>/', views.payment_status, name='payment_status'),
    path('payment/check_status/', views.check_payment_status, name='check_payment_status'),

]