from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'khan.views.home', name='home'),
    # url(r'^khan/', include('khan.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
  url(r'^admin/', include(admin.site.urls)),
	
	url(r'^login/$', 'django.contrib.auth.views.login',{'template_name':'site/login.html'}),
	url(r'^logout/$', 'django.contrib.auth.views.logout',{'next_page':'/'}),
	
	url(r'^$', 'khan.site.views.front_page', name='front_page'),
	url(r'^init_pipe/$', 'khan.site.views.init_pipe', name='init_pipe'),
	url(r'^online_users/json/$', 'khan.site.views.online_users_json', name='online_users_json'),
	url(r'^channels/json/$', 'khan.channel.views.latest_active_json', name='channels_json'),
	url(r'^channels/(?P<id>\d)/json/$', 'khan.channel.views.detail_json', name='channels_detail_json'),

	
		
)

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
urlpatterns += staticfiles_urlpatterns()

