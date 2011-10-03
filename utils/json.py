
import datetime
import decimal

from django.utils import simplejson
from django.utils import datetime_safe

DATE_FORMAT = "%Y-%m-%d"
TIME_FORMAT = "%H:%M:%S"

def queryset_to_json(o):
	new_list = []
	for i,item in enumerate(o):
		for k,v in item.iteritems():
			item[k] = encode_type(v)
		new_list.append(item)
	return simplejson.dumps(new_list)
	
def encode_type(o):
	if isinstance(o, datetime.datetime):
		d = datetime_safe.new_datetime(o)
		return d.strftime("%s %s" % (DATE_FORMAT, TIME_FORMAT))
	elif isinstance(o, datetime.date):
		d = datetime_safe.new_date(o)
		return d.strftime(DATE_FORMAT)
	elif isinstance(o, datetime.time):
		return o.strftime(TIME_FORMAT)
	elif isinstance(o, decimal.Decimal):
		return str(o)
	else:
		return o

class ResponseStatus:
	
	def __init__(self,status,description):
		self.status = status
		self.description = description
		self.now = datetime.datetime.today()
	
	def __json__(self):
		return {
			'status': self.status,
			'description': self.description,
			'now': encode_type(self.now)
		}
