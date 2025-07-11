from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    # ex: /polls/5/
    path("<int:question_id>/", views.detail, name="detail"),
    # ex: /polls/5/results/
    path("<int:question_id>/results/", views.results, name="results"),
    # ex: /polls/5/vote/
    path("<int:question_id>/vote/", views.vote, name="vote"),
    path("test404/", views.test404, name="This is a sample 404 page for the testing of certain functionalities"),
#     path("iOLE/", views.iole, name = "Where does this name go?"),
#     path("example_index_2/", views.index, name = "This is an example for the things that we did"),
     path("iole2/", views.iole2, name="iole2"),
#     path("showpipes/",views.showpipes,name="Showing pipes"),
]

