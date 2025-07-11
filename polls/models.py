from django.db import models
from django.utils import timezone
import datetime

# Create your models here.
class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")
    def __str__(self):
        return self.question_text
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    def __str__(self):
        return self.choice_text 



class InpFile(models.Model):
    fileName = models.CharField(max_length=200)
    def __str__(self):
        return self.fileName
    
class PipeType(models.Model):
    typeName = models.CharField(max_length=100)
    def __str__(self):
        return self.typeName

class Node(models.Model):
     nodeId = models.CharField(max_length=10)

    
class Pipe(models.Model):
    inpFile = models.ManyToManyField(InpFile)
    pipeName = models.CharField(max_length=200)
    nodes = models.ManyToManyField(Node)
    #pipeType = models.CharField(choices="pipe", "pump", "reservoir")
    #pipeType = models.ForeignKey(PipeType, on_delete=models.CASCADE)
    def __str__(self):
        return self.pipeName
    
    ## google django choice field.


class Sensor(models.Model):
    inpFile = models.ManyToManyField(InpFile)
    sensorName = models.CharField(max_length=200)
    sensorNode = models.ForeignKey(Node, on_delete=models.CASCADE)
    sensorXCoord = models.FloatField()
    sensorYCoord = models.FloatField()
    def __str__(self):
        return self.sensorName


# class Pipe(models.Model):
#     pipeId = models.CharField(max_length=100)
#     pipeSrc = models.ForeignKey(Node)
#     pipeDst = models.CharField(max_length=100)
#     def __str(self):
#         return self.pipeId



































#Take a step back - the goal was to have on one hand a schema of the entities. 
# Maybe infer some attributes from the interface.
# Have some kind of patience and just code the model down.
# Status for the pipe, probability that it's leaking, scale.
# TimeSeries for pressure or (data from the model)
# Maybe it has like 
# node class, node id, type (reservoir, pump, just pipe)
# Model the network, the pipe list 
# Have a all the pipes refer to the network.
# represent the network very exactly
# in the database we need to have different networks
# the network for the model would be networkID/city/sourceINP file
# the pipe would always refer to a network id as children
# or just filter out the reservoirs or maybe the same city has different INP files and hten 
# if we start from nothing and we want to be able to deliver all the functionalities, then what information
# we could also store the file (same city, different network, different INP files)
# Research of Johannes and Enrique and Ella - they use INP files to calibrate things liek demand patterns
# it could be like in the INP files there are assumptions about the network, but they have an influence on the leak detection
# maybe we have the model with some INP files that say there is a leak, the models with other INP files might say that there is no leak
# in the INP file they store demand patterns - sensitivity analysis they tried to modify those patterns - adding noise 
# At the end it could very well be that a city has 1 INP file and it is the source of truth
# in our context, we might experiment with different INP files 

# depends on how we want to ship our product
# how we will be allowed to ship the application
# if we deploy in the cloud and we have 1 instance for all cclients, then we need 1 database. 
# if each client has it's own instance, then they each need their own database
# we can do both - we can try to do both - we can support both.

# start asking Q - how does LILA work, what do I have to install to install a model, what are the files
# same for the DM 
# we need to run the models 

# with the time series . Time series - both output and input. We need models for time series 
# if we havquite pressure time series - for which pipe id at which time which model

# we also need to have a leak model
# maybe additional properties for each leakage - display some metrics about the leak that are relevant to the user, to the utilities
# you need to store them, update them, build time-series - for now ignore implementation details (size )
# just represent the data in the application
# 
# We talked about modelling, 
#
# Main target for next week:    extend the schema of the database, model the data
#                               in the prototype we have fixtures - data that the dev puts in the application - all data hardcoded in the HTML - Fixtures - we use this term in test. To "fix" the state before the test to verify some assumptions about something. If I give oyu this network, will you ... 
#                               There is a way to write custom management commands. I need to write a management command where I put all these fixtures into the databases. 
#                                   For instance, in polls create management dircetory, subdirectory commands, in these commands I can ha ve a file that called generic name that contains a script that can be executed by "python manage.py iole prototype" and this will put the database where it belongs and also outside the application code I have to model it so that the database cn read and write this data
#                                   What is the interface between back end and front end to visualize and update .
# main goal
# model data - write management command - if there is time - start this github tests workflow. There is a learning curve to all that.
#
#
#
#Next meeting: Tuesday 11 AM next week. Tuesday 24. June 11 am
#