# Create your views here.

from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import simplejson
from django.contrib.auth.models import User

from khan.channel.models import Channel
from khan.utils.json import queryset_to_json
from khan.utils.redis_helper import get_redis
from khan.site import redisk

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

@login_required
@require_http_methods(["POST"])
def join(request,id):
	redisdb = get_redis()
	"""put channels into user
	"""
	redis_channel_join_key = redisk.get_channel_join_key(request.session.session_key)
	redisdb.sadd(redis_channel_join_key,id)
	"""put users into channel
	"""
	redis_channel_users_key = redisk.get_channel_users_key(id)
	redisdb.sadd(redis_channel_users_key,request.user.pk)
	return HttpResponse()

@login_required
@require_http_methods(["POST"])
def leave(request,id):
	redisdb = get_redis()
	"""remove channels into user
	"""
	redis_channel_join_key = redisk.get_channel_join_key(request.session.session_key)
	redisdb.srem(redis_channel_join_key,id)
	"""remove users into channel
	"""
	redis_channel_users_key = redisk.get_channel_users_key(id)
	redisdb.srem(redis_channel_users_key,request.user.pk)
	return HttpResponse()

@login_required
def users_json(request,id):
	redisdb = get_redis()
	redis_channel_users_key = redisk.get_channel_users_key(id)
	users = redisdb.smembers(redis_channel_users_key)
	keys = list(users)
	
	users = User.objects.in_bulk(keys).values()
	
	users_list = []
	for key in users:
		users_list.append({
			'id':key.pk,
			'username':key.username
		})
	
	json = simplejson.dumps(users_list)
	return HttpResponse(json, mimetype='application/json')

