# Create your views here.

from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from khan.channel.models import Channel
from khan.utils.json import queryset_to_json

@login_required
def latest_active_json(request):
	channels = Channel.objects.all().values()
	json = queryset_to_json(channels)
	return HttpResponse(json, mimetype='application/json')

@login_required
def detail_json(request,id):
	channel = Channel.objects.filter(pk=id).values()
	json = queryset_to_json(channel)
	return HttpResponse(json, mimetype='application/json')
