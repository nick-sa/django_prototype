from django.shortcuts import render
from src.iole.models import Node, Pipe, InpFile

#workingInpFile = 0#"nw_01_primal_model.inp"
# currentInpFile = InpFile.objects.get(fileName = "nw_01_primal_model.inp")
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
        nodeList.append([node.x_coordinate, node.y_coordinate, node.name])

    pipes = Pipe.objects.filter(inpFile = currentInpFile)
    pipesToList = list(pipes)
    pipeList = []
    for pipe in pipesToList:
        pipeList.append([pipe.to_node, pipe.from_node, pipe.name])

    sensors = Sensor.objects.filter(inpFile = currentInpFile)
    sensorsToList = list(sensors)
    sensorList = []
    for sensor in sensorsToList:
        sensorList.append([sensor.sensorXCoord, sensor.sensorYCoord, sensor.sensorName])
    return render(request, "iole/iole_interface.html", {"nodesFromDB":nodeList, "pipesFromDB":pipeList, "sensorsFromDB":sensorList})

def mapLibre(request):
    nodes = Node.objects.filter(inpFile = currentInpFile)
    #nodes = Node.objects.all()
    nodesToList = list(nodes)
    nodeList = []
    for node in nodesToList:
        nodeList.append([node.x_coordinate, node.y_coordinate, node.name])
    return render(request, "iole/mapLibre.html", {"nodesFromDB":nodeList})