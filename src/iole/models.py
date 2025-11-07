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
    

class VirtualFlow(models.Model):
    node = models.ForeignKey(Node, models.CASCADE)
    time_stamp = models.DateTimeField()
    value = models.FloatField()
    
    def __str__(self):
        return self.value


"""
class Leakage(models.Model):
    description = models.CharField(max_length=200)
    model = models.CharField(choices=[LILA, DM])
    detection_time = ...
    pipes = ...
    most_affected_sensor = ...
"""


class Leakages(models.Model):
    inp_file = models.ForeignKey(InpFile, models.CASCADE, blank=True, null=True)
    leakage_name = models.CharField(max_length=200)
    # detection time
    dt_lila = models.DateTimeField(null=True, blank=True)
    dt_dm = models.DateTimeField(null=True, blank=True)
    # most affected sensor
    mas_lila = models.CharField(max_length=200, null=True, blank=True)
    # dual model
    pipes_dm = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.leakage_name


class VirtualPressure(models.Model):
    node = models.ForeignKey(Node, models.CASCADE)
    time_stamp = models.DateTimeField()
    value = models.FloatField()
    
    def __str__(self):
        return self.value
    

class RawPressure(models.Model):
    node = models.ForeignKey(Node, models.CASCADE)
    time_stamp = models.DateTimeField()
    value = models.FloatField()
    
    def __str__(self):
        return self.time_stamp



