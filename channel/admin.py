from django.contrib import admin
from khan.channel.models import Channel

class ChannelAdmin(admin.ModelAdmin):
	
	fields = ('name','tags')
	
	def save_model(self, request, obj, form, change):
		obj.creator = request.user
		obj.save()
	
admin.site.register(Channel,ChannelAdmin)
