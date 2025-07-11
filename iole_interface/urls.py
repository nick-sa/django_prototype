from django.urls import path

from . import views

urlpatterns = [
    path("", views.iole_interface, name="index_name")
]