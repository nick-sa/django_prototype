import pandas as pd
from django.core.management.base import BaseCommand
from src.iole.models import Node, InpFile, Pipe, VirtualFlow, Leakages, RawPressure
import datetime
import src.iole.management.commands.DM_simulation as DM
import src.iole.management.commands.LILA_simulation as LILA


class Command(BaseCommand):
    help = 'performs the regular cron job'

    #check current time
   

    def handle(self, *args, **kwargs):
        current_time =  datetime.datetime.now().timestamp()
        print(current_time)
        
        #retrieve raw pressures

        #time after/before which we filter things (in practice it would be a time in the past, now it is in the future because we have pressures in the future)
        cutoff_time = datetime.datetime.now() + datetime.timedelta(days = 10)
        #save all raw pressures for the desired timeframe into "raw_pressures"
        raw_pressures = RawPressure.objects.filter(time_stamp__gt=datetime.datetime.now(), time_stamp__lt=cutoff_time).all()
        raw_pump_flows = []
        raw_in_flows = []
        #external_flows
        print(cutoff_time)
        print(datetime.datetime.now())
        #print(raw_pressures)
        print(type(raw_pressures))
        print(len(raw_pressures))
        #required format 2025-11-05 10:22:11.592530
        #now we send the latest up to date pressures to DM/LILA 

        print("files being sent to DM/LILA")


        print(DM.init())
        print(LILA.init())


        virtual_flows_up_to_date = []
        virtual_pressures_up_to_date = []
        leakage_detection_timestamp_lila = []
        leakage_detection_timestamp_dm = []
        affected_pipes_dm = []
        most_affected_sensor_lila = []

        #assume the response is in these variables, with virtual pressures hopefully/probably coming with timestamps.



        #### from DM/LILA we receive a response (function return), containing leakages with affected pipes/sensors virtual pressures/virtual flows that need to be populated into the database, as well as detections. 




        #save virtual pressures from LILA with (or without?) updating the data

        #save virtual flows from DM with (or without?) updating the date


        #save leakages (leakages contain affected pipes and most affected sensor)
