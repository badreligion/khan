# Create your views here.

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponseServerError, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import simplejson

from redis import Redis


def front_page(request):
	if request.user.is_authenticated():
		return render_to_response('site/welcome.html',{},context_instance=RequestContext(request))
	else:
		return render_to_response('site/front_page.html',{},context_instance=RequestContext(request))

#TODO: have to be more validation
@login_required
@require_http_methods(["POST"])
def init_pipe(request):
	redisdb = Redis(host='localhost',port=6379)
	if not redisdb.exists(request.session.session_key):
		user = {
			'username':request.user.username,
			'email':request.user.email
		}
		if not redisdb.hmset(request.session.session_key,user):
			print 'cant save to redis'
			return HttpResponseServerError('cant save to redis')
	return HttpResponse('ok')



@login_required
def online_users_json(request):
	redisdb = Redis(host='localhost',port=6379)
	keys = redisdb.keys('*')
	
	users = []
	for key in keys:
		users.append(redisdb.hgetall(key))
	
	print users
	
	json = simplejson.dumps(users)
	return HttpResponse(json, mimetype='application/json')

