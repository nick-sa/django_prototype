import pandas as pd
from django.core.management.base import BaseCommand
from src.iole.models import Node, InpFile, Pipe, VirtualFlow, Leakages, RawPressure
import datetime


class Command(BaseCommand):
    help = 'loads nodes.csv and pipes.csv in the db'

    def handle(self, *args, **kwargs):

        nodes = pd.read_csv("src/iole/management/commands/nodes.csv")


       
        pressures = pd.read_csv("src/iole/management/commands/data_04_primal_pressures_short.csv") 
        timestamps = pd.to_timedelta(pressures.timestamp) + datetime.datetime.now()

        
        for node_name in pressures.columns[1:]:
            data = pressures[node_name]
            sensor = Node.objects.get(name=node_name)
            raw_pressures = [
                RawPressure(node=sensor,time_stamp=t,value=v) 
                for t,v in zip(timestamps,data)
            ]
            RawPressure.objects.bulk_create(raw_pressures)



