
PREFIX_SESSION = 'Session.'
PREFIX_CHANNEL_JOIN = 'User.Join.'
PREFIX_CHANNEL_USERS = 'Channel.Users.'

def get_session_key(session_key):
	return '%s%s' % (PREFIX_SESSION,session_key)

def get_channel_join_key(session_key):
	return '%s%s' % (PREFIX_CHANNEL_JOIN,session_key)

def get_channel_users_key(session_key):
	return '%s%s' % (PREFIX_CHANNEL_USERS,session_key)
