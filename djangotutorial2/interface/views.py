from django.shortcuts import render
from .models import Node, Pipe, Sensor, InpFile

#workingInpFile = 0#"nw_01_primal_model.inp"
currentInpFile = InpFile.objects.get(fileName = "nw_01_primal_model.inp")
# Create your views here.
def iole(request):
    #junctionList2 = []
    #for pipe in Pipe.objects.all():
    #    junctionList2.append([pipe.pipeName])
    nodes = Node.objects.filter(inpFile = currentInpFile)
    #nodes = Node.objects.all()
    nodesToList = list(nodes)
    nodeList = []
    for node in nodesToList:
        nodeList.append([node.nodeXCoord, node.nodeYCoord, node.nodeName])

    pipes = Pipe.objects.filter(inpFile = currentInpFile)
    pipesToList = list(pipes)
    pipeList = []
    for pipe in pipesToList:
        pipeList.append([pipe.toNode, pipe.fromNode, pipe.pipeName])

    sensors = Sensor.objects.filter(inpFile = currentInpFile)
    sensorsToList = list(sensors)
    sensorList = []
    for sensor in sensorsToList:
        sensorList.append([sensor.sensorXCoord, sensor.sensorYCoord, sensor.sensorName])
    return render(request, "interface/iole_interface.html", {"nodesFromDB":nodeList, "pipesFromDB":pipeList, "sensorsFromDB":sensorList})

def mapLibre(request):
    nodes = Node.objects.filter(inpFile = currentInpFile)
    #nodes = Node.objects.all()
    nodesToList = list(nodes)
    nodeList = []
    for node in nodesToList:
        nodeList.append([node.nodeXCoord, node.nodeYCoord, node.nodeName])
    return render(request, "interface/mapLibre.html", {"nodesFromDB":nodeList})