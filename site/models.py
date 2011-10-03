from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Tag(models.Model):
	name = models.CharField(max_length=20, unique=True, blank=False, db_index=True)
	creator = models.ForeignKey(User)
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	
	def __unicode__(self):
		return self.name

	class Meta:
		db_table = 'tags'
