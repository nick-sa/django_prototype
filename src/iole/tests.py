from django.test import TestCase

# Create your tests here.
def test_test():
    print("this has been printed form inside the tests.py file")

class firstTest(TestCase):
    def test_something(self):
        self.assertTrue(1+1==1)