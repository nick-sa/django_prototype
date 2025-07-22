from django.contrib import admin

# Register your models here.
from src.iole.models import InpFile, Pipe, Node

admin.site.register(Node)

admin.site.register(InpFile)

admin.site.register(Pipe)


