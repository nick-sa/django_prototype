from django.test import TestCase
from src.iole.models import InpFile, Node

# Create your tests here.
def test_test():
    print("this has been printed form inside the tests.py file")

class firstTest(TestCase):
    def test_something(self):
        self.assertTrue(1+1==2)


class InpFileTestCase(TestCase):
    def setUp(self):
        InpFile.objects.create(filename = "testFileName")
        #InpFile.objects.create(fileName="testFileName2")
    def test_inpFile_created_successfully(self):
        ourInpFile = InpFile.objects.filter(filename = "testFileName")
        #self.assertEqual(ourInpFile.first().fileName, "testFileName")


class NodeTestCase(TestCase):
    def setUp(self):
        InpFile.objects.create(filename = "testFileName")
        Node.objects.create( name = "nodeName", x_coordinate = 2.0, y_coordinate = 4.0, has_sensor = True, inp_file = InpFile.objects.get(filename = "testFileName"))

    def test_node(self):
        Node.objects.filter( name = "nodeName")

