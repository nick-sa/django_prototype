import pandas as pd
from django.core.management.base import BaseCommand
from src.iole.models import Node, InpFile, Pipe


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
