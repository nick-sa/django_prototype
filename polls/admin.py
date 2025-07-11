from django.contrib import admin

# Register your models here.

from .models import Question, Choice, Node, InpFile, Pipe, Sensor, PipeType

admin.site.register(Question)

admin.site.register(Choice)


admin.site.register(Node)

admin.site.register(InpFile)

admin.site.register(Pipe)

admin.site.register(Sensor)

admin.site.register(PipeType)