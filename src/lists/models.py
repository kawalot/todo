from django.db import models
from django.urls import reverse
from django.conf import settings


class List(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        blank=True, 
        null=True, 
        on_delete=models.CASCADE
    )

    @property
    def name(self):
        return self.item_set.first().text

    def get_absolute_url(self):
        return reverse("view_list", args=[self.id])
    

class Item(models.Model):
    text = models.TextField(default='')
    lst = models.ForeignKey(List, default=None, on_delete=models.CASCADE)

    class Meta:
        ordering = ('id',)
        unique_together = ('lst', 'text')

    def __str__(self):
        return self.text