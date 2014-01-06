<?

if (strstr($_SERVER['HTTP_USER_AGENT'], 'GitHub Hookshot') !== false && strstr($_SERVER['REMOTE_ADDR'], '192.30.252.') !== false) {
	system('git pull');
}
