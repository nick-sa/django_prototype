import pandas as pd
from django.core.management.base import BaseCommand
from src.iole.models import Node, InpFile, Pipe, VirtualFlow, Leakages
import datetime


class Command(BaseCommand):
    help = 'loads nodes.csv and pipes.csv in the db'

    def handle(self, *args, **kwargs):

        inp_file, _ = InpFile.objects.get_or_create(filename="nw_01_primal_model.inp")
        nodes = pd.read_csv("src/iole/management/commands/nodes.csv")
        for row in nodes.itertuples():
            Node.objects.get_or_create(
                inp_file=inp_file,
                name=row.name,
                x_coordinate=row.x_coordinate,
                y_coordinate=row.y_coordinate,
                has_sensor=row.has_sensor
            )

        pipes = pd.read_csv("src/iole/management/commands/pipes.csv")

        for row in pipes.itertuples():
            from_node = Node.objects.get(name=row.from_node)
            to_node = Node.objects.get(name=row.to_node)
            Pipe.objects.get_or_create(
                inp_file=inp_file,
                name=row.name,
                from_node=from_node,
                to_node=to_node
            )

        self.stdout.write(self.style.SUCCESS('Successfully added elements.'))


        flows = pd.read_csv("src/iole/management/commands/virtual_flow_test.csv")
        timestamps = pd.to_timedelta(flows.timestamp) + datetime.datetime.now()
        #print(timestamps)
        
        for node_name in flows.columns[1:]:
            data = flows[node_name]
            node_name = node_name.replace("vp_","")
            sensor = Node.objects.get(name=node_name)
            v_flows = [
                VirtualFlow(node=sensor,time_stamp=t,value=v) 
                for t,v in zip(timestamps,data)
            ]
            VirtualFlow.objects.bulk_create(v_flows)


        pressures = pd.read_csv("src/iole/management/commands/virtual_pressures.csv")
        timestamps_pressures = pd.to_timedelta(flows.timestamp) + datetime.datetime.now()
        #print(timestamps)
        
        for node_name in pressures.columns[1:]:
            data_pressures = pressures[node_name]
            #node_name = node_name.replace("vp_","")
            sensor = Node.objects.get(name=node_name)
            v_flows = [
                VirtualFlow(node=sensor,time_stamp=t,value=v) 
                for t,v in zip(timestamps_pressures,data_pressures)
            ]
            VirtualFlow.objects.bulk_create(v_flows)


        leakages = [
        ["Another example of a leakage", "n469", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98"], "2019-02-02T11:36:25.000Z"],
        ["Another example of a leakage only LILA", "n469", "2019-01-27T14:36:25.000Z",["p652", "p653", "p654", "p655", "p656", "p657", "p658"], "2019-02-02T11:36:25.000Z"],
        ["Another example of a leakage", "n613", "2019-01-27T14:36:25.000Z", ["p652", "p653", "p654", "p655", "p656", "p657", "p658"], "2019-02-02T11:36:25.000Z"],
        ["New most recent leak", "n469", "2019-01-27T14:36:25.000Z", ["p96", "p97", "p98", "p99", "p100", "p101", "p192"], "2019-01-20T11:36:25.000Z"],
        ]

        for leakage in leakages:
            Leakages.objects.get_or_create(
                inp_file = inp_file,
                leakage_name = leakage[0],
                dt_lila = datetime.datetime.strptime(leakage[2], "%Y-%m-%dT%H:%M:%S.%fZ" ), #datetime.datetime(leakage[2]),
                mas_lila = leakage[1],
                    dt_dm = datetime.datetime.strptime(leakage[4], "%Y-%m-%dT%H:%M:%S.%fZ" ), #datetime.datetime(leakage[2]),
                    pipes_dm = leakage[3],
            )


            
