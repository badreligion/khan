from django.contrib import admin
from khan.site.models import Tag

class TagAdmin(admin.ModelAdmin):
	
	fields = ('name',)
	
	def save_model(self, request, obj, form, change):
		obj.creator = request.user
		obj.save()

admin.site.register(Tag,TagAdmin)
