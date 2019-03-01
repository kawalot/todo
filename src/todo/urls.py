#from django.contrib import admin
from django.urls import include, path
from lists import views as list_views
from lists import urls as list_urls
from accounts import urls as accounts_urls
# from lists import api_urls
from lists.api import router

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('', list_views.home_page, name='home'),
    path('lists/', include(list_urls)),
    path('accounts/', include(accounts_urls)),
    #path('api/', include(api_urls)),
    path('api/', include(router.urls)),
]
