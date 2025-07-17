from django.db import models
from django.utils import timezone
import datetime

class InpFile(models.Model):
    fileName = models.CharField(max_length=200)
    def __str__(self):
        return self.fileName


class Node(models.Model):
    nodeName = models.CharField(max_length=10)
    nodeXCoord = models.FloatField()
    nodeYCoord = models.FloatField()
    inpFile = models.ManyToManyField(InpFile)    
    def __str__(self):
        return self.nodeName
    
class Pipe(models.Model):
    inpFile = models.ManyToManyField(InpFile)
    pipeName = models.CharField(max_length=200)
    # fromNode = models.ManyToManyField(
    #     Node,
    #     #null = True,
    #     blank = True,
    #     #on_delete=models.SET_NULL,
    # )
    # toNode = models.ManyToManyField(
    #     Node,
    #     #null = True,
    #     blank = True,
    #     #on_delete=models.SET_NULL,
    # )
    fromNode = models.CharField(max_length=200)
    toNode = models.CharField(max_length=200)
    def __str__(self):
        return self.pipeName


class Sensor(models.Model):
    inpFile = models.ManyToManyField(InpFile)
    sensorName = models.CharField(max_length=200)
    sensorXCoord = models.FloatField()
    sensorYCoord = models.FloatField()
    sensorNode = models.ManyToManyField(
        Node,
        #null=True,
        blank=True,
        #on_delete=models.SET_NULL,
    )
    def __str__(self):
        return self.sensorName