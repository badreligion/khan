from django.db import models
from django.contrib.auth.models import User

from khan.site.models import Tag

# Create your models here.

class Channel(models.Model):
	name = models.CharField(max_length=50, unique=True, blank=False, db_index=True)
	tags = models.ManyToManyField(Tag, blank=True)
	creator = models.ForeignKey(User)
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	
	def __unicode__(self):
		return self.name
		
	class Meta:
		db_table = 'channels'
		ordering = ['-created']
