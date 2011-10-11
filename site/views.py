# Create your views here.

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponseServerError, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import simplejson

from khan.utils.redis_helper import get_redis
from khan.site import redisk

def front_page(request):
	if request.user.is_authenticated():
		return render_to_response('site/welcome.html',{},context_instance=RequestContext(request))
	else:
		return render_to_response('site/front_page.html',{},context_instance=RequestContext(request))

#TODO: have to be more validation
@login_required
@require_http_methods(["POST"])
def init_pipe(request):
	redisdb = get_redis()
	redis_session_key = redisk.get_session_key(request.session.session_key)
	if not redisdb.exists(redis_session_key):
		user = {
			'username':request.user.username,
			'email':request.user.email,
			'pk':request.user.pk
		}
		if not redisdb.hmset(redis_session_key,user):
			print 'cant save to redis'
			return HttpResponseServerError('cant save to redis')
	return HttpResponse('ok')


	