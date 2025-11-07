from django.test import TestCase, Client
from django.core.management import call_command
from django.utils import timezone
from datetime import timedelta
from .models import VirtualFlow

# Create your tests here.
def test_test():
    print("this has been printed form inside the tests.py file")


class TestIndexPage(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("load_ltown_network_short") #add an option to load only a few flows for testing purposes (arguments)

    def test_index_page(self):
        given_inp_file_name = "nw_01_primal_model.inp"
        client = Client()

        response = client.get("", query_params=dict(inp_filename=given_inp_file_name))

        self.assertEqual(response.status_code, 200)

        self.assertTrue("text/html" in response.headers.get("Content-Type",""))


class TestVirtualFlows(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("load_ltown_network_short") 

    def test_virtual_flow_future(self):
        all_flows = VirtualFlow.objects.all()
        virtual_flows = VirtualFlow.objects.filter(time_stamp__gte=timezone.now()+timedelta(minutes=10))
        self.assertTrue(all_flows.exists())
        self.assertTrue(virtual_flows.exists())
        
    def test_virtual_flow_past(self):
        virtual_flows = VirtualFlow.objects.filter(time_stamp = timezone.now() + timedelta(minutes = - 10))
        self.assertFalse(virtual_flows.exists())



class TestLeakageRequest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        call_command("load_ltown_network_short") 

    def test_leakage_fetch_request(self):
        client = Client()
        response = client.get("leakages")
        self.assertEqual(response.status_code,200)
