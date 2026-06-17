"""
AI Student PRO — API URL маршруттары
"""
from django.urls import path

from . import views

urlpatterns = [
    path("analyze/", views.analyze_lecture, name="analyze_lecture"),
]
