from django.shortcuts import render
from src.iole.models import Node, Pipe, InpFile,VirtualFlow, Leakages, VirtualPressure
from django.http import JsonResponse
import datetime
#from datetime import fromtimestamp 


# workingInpFile = 0#"nw_01_primal_model.inp"
# currentInpFile = InpFile.objects.get(fileName = "nw_01_primal_model.inp")
# Create your views here.

def home_page(request):
    inp_filename = request.GET.get("inp_filename", "nw_01_primal_model.inp")
    inp_file = InpFile.objects.get(filename=inp_filename)
    nodes = Node.objects.filter(inp_file=inp_file)
    pipes = Pipe.objects.filter(inp_file=inp_file)


    pipe_coordinates = []
    for pipe in pipes:

        from_node = Node.objects.filter(name=pipe.from_node)[0]
        to_node = Node.objects.filter(name=pipe.to_node)[0]

        pipe_coordinates.append([[from_node.y_coordinate, from_node.x_coordinate],[to_node.y_coordinate, to_node.x_coordinate],pipe.name])

    nodeList = []
    for node in list(nodes):
        nodeList.append([node.y_coordinate, node.x_coordinate, node.name, node.has_sensor])
    #nodeList_dictionary = dict(nodes = nodeList)


    return render(request, "mapLibre.html", {"nodesFromDB": nodeList, "pipeCoordinates": pipe_coordinates} )




def get_virtual_flow(request):
    sensor_name = request.GET["sensor_name"]
    from_date = datetime.datetime.fromtimestamp(int(request.GET.get("from",datetime.datetime.now()))/1000)
    to_date = datetime.datetime.fromtimestamp(int(request.GET.get("to", datetime.datetime.now()))/1000)
    flows = VirtualFlow.objects.filter(node__name=sensor_name,time_stamp__gt=from_date,time_stamp__lt=to_date).all()
    data = dict(sensor_name = sensor_name, time_stamp = [], value = [])
    for flow in flows:
        data["time_stamp"] += [flow.time_stamp]
        data["value"] += [flow.value]
        
    return JsonResponse(data)

def get_virtual_pressure(request):
    sensor_name = request.GET["sensor_name"]
    from_date = datetime.datetime.fromtimestamp(int(request.GET.get("from",datetime.datetime.now()))/1000)
    to_date = datetime.datetime.fromtimestamp(int(request.GET.get("to", datetime.datetime.now()))/1000)
    flows = VirtualPressure.objects.filter(node__name=sensor_name,time_stamp__gt=from_date,time_stamp__lt=to_date).all()
    data = dict(sensor_name = sensor_name, time_stamp = [], value = [])
    for flow in flows:
        data["time_stamp"] += [flow.time_stamp]
        data["value"] += [flow.value]
        
    return JsonResponse(data)


def get_nodes(request):
    inp_file_string = request.GET["inp_file"]
    inp_file_object = InpFile.objects.get(filename=inp_file_string)
    nodes = Node.objects.filter(inp_file=inp_file_object)
    node_dictionary = dict(inp_file = inp_file_string, name = [], x_coordinate = [], y_coordinate = [])
    #node_list = []
    for node in list(nodes):
        node_dictionary["name"].append(node.name)
        #print(node.name, node.x_coordinate)
        node_dictionary["x_coordinate"].append(node.x_coordinate)
        node_dictionary["y_coordinate"].append(node.y_coordinate)

    nodeList = []
    for node in list(nodes):
        nodeList.append([node.y_coordinate, node.x_coordinate, node.name, node.has_sensor])
        print(node.has_sensor)
    #nodes_dictionary = dict(nodes = node_list)

    return JsonResponse(dict(nodes = nodeList))

def get_pipes(request):
    inp_file_string = request.GET["inp_file"]
    inp_file_object = InpFile.objects.get(filename=inp_file_string)
    pipes = Pipe.objects.filter(inp_file=inp_file_object)
    #pipe_dictionary = dict(inp_file=inp_file_string, from_node = [], to_node = [])
    
    pipe_coordinates = []
    for pipe in pipes:

        from_node = Node.objects.filter(name=pipe.from_node)[0]
        to_node = Node.objects.filter(name=pipe.to_node)[0]
        pipe_name = pipe.name
        pipe_coordinates.append([[from_node.y_coordinate, from_node.x_coordinate],[to_node.y_coordinate, to_node.x_coordinate], pipe_name])
    
    pipe_dictionary = dict(pipes = pipe_coordinates)
    return JsonResponse(pipe_dictionary)

def get_leakages(request):
    #inp_file_string = request
    inp_file_string = request.GET["inp_file"]
    inp_file_object = InpFile.objects.get(filename=inp_file_string)
    leakages = Leakages.objects.filter(inp_file=inp_file_object)
    data = dict(imp_file = inp_file_string, dt_lila = [], dt_dm = [], mas_lila = [], pipes_dm = [], leakage_name = [])
    for leakage in leakages:
        data["leakage_name"].append(leakage.leakage_name)
        data["dt_lila"].append(leakage.dt_lila)
        data["dt_dm"].append(leakage.dt_dm)
        data["mas_lila"].append(leakage.mas_lila)
        data["pipes_dm"].append(leakage.pipes_dm)
        
    return JsonResponse(data)