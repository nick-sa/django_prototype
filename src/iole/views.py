from django.shortcuts import render
from src.iole.models import Node, Pipe, InpFile


# workingInpFile = 0#"nw_01_primal_model.inp"
# currentInpFile = InpFile.objects.get(fileName = "nw_01_primal_model.inp")
# Create your views here.
def iole(request):
    inp_filename = request.GET.get("inp_filename", "nw_01_primal_model.inp")
    inp_file = InpFile.objects.get(filename=inp_filename)
    nodes = Node.objects.filter(inp_file=inp_file)
    nodeList = []
    sensorList = []
    for node in nodes:
        nodeList.append([node.x_coordinate, node.y_coordinate, node.name])
        if node.has_sensor:
            sensorList.append([node.x_coordinate, node.y_coordinate, node.name])
    pipes = Pipe.objects.filter(inp_file=inp_file)
    pipeList = []
    for pipe in pipes:
        pipeList.append([pipe.to_node.name, pipe.from_node.name, pipe.name])

    return render(request, "iOLE_interface.html",
                  {"nodesFromDB": nodeList, "pipesFromDB": pipeList, "sensorsFromDB": sensorList})


def mapLibre(request):
    inp_filename = request.GET.get("inp_filename", "nw_01_primal_model.inp")
    inp_file = InpFile.objects.get(filename=inp_filename)
    nodes = Node.objects.filter(inp_file=inp_file)
    # nodes = Node.objects.all()
    nodesToList = list(nodes)
    nodeList = []
    for node in nodesToList:
        nodeList.append([node.x_coordinate, node.y_coordinate, node.name])
    return render(request, "iole/mapLibre.html", {"nodesFromDB": nodeList})
