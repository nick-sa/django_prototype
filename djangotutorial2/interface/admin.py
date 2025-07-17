from django.contrib import admin

# Register your models here.
from .models import InpFile, Pipe, Sensor, Node

admin.site.register(Node)

admin.site.register(InpFile)

admin.site.register(Pipe)

admin.site.register(Sensor)

