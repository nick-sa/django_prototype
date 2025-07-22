from django.db import models


class InpFile(models.Model):
    filename = models.CharField(max_length=200)

    def __str__(self):
        return self.filename


class Node(models.Model):
    name = models.CharField(max_length=10)
    x_coordinate = models.FloatField()
    y_coordinate = models.FloatField()
    has_sensor = models.BooleanField()

    inp_file = models.ForeignKey(InpFile, models.CASCADE)

    def __str__(self):
        return self.name


class Pipe(models.Model):
    inp_file = models.ForeignKey(InpFile, models.CASCADE)
    name = models.CharField(max_length=200)
    from_node = models.ForeignKey(Node, models.CASCADE, related_name="upstream_pipe_set")
    to_node = models.ForeignKey(Node, models.CASCADE, related_name="downstream_pipe_set")

    def __str__(self):
        return self.name

