from django.contrib import admin

# Register your models here.
from src.iole.models import InpFile, Pipe, Node, VirtualFlow, Leakages, VirtualPressure, RawPressure

admin.site.register(Node)

admin.site.register(InpFile)

admin.site.register(Pipe)

admin.site.register(VirtualFlow)

admin.site.register(VirtualPressure)

admin.site.register(Leakages)

admin.site.register(RawPressure)

