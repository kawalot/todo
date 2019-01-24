from django.db import models


class List(models.Model):
    pass


class Item(models.Model):
    text = models.TextField(default='')
    lst = models.ForeignKey(List, default=None, on_delete=models.CASCADE)