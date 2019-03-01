import json
from django.http import HttpResponse
from lists.models import List, Item
from rest_framework import routers, serializers, viewsets

def lists(request, list_id):
    list_ = List.objects.get(id=list_id)
    if request.method == 'POST':
        Item.objects.create(lst=list_, text=request.POST['text'])
        return HttpResponse(status=201)
    item_dicts = [
        {'id': item.id, 'text': item.text} for item in list_.item_set.all()
    ]
    return HttpResponse(json.dumps(item_dicts), content_type='application/json')


class ItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Item
        fields = ('id', 'lst', 'text')


class ListSerializer(serializers.ModelSerializer):
    items = ItemSerializer(many=True, source='item_set')

    class Meta:
        model = List
        fields = ('id', 'items',)


class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.all()
    serializer_class = ListSerializer

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

router = routers.SimpleRouter()
router.register(r'lists', ListViewSet)
router.register(r'items', ItemViewSet)