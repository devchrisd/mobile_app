<?php


$method = 'GET';

if (isset($_REQUEST['url']) )
{
	$url = $_REQUEST['url'];
}

$query = $_REQUEST;
unset($query['url']);
/*
if (isset($_REQUEST['screen_name']) )
{
	$query['screen_name'] = $_REQUEST['screen_name'];
}

if (isset($_REQUEST['count']))
{
	$query['count'] = $_REQUEST['count'];
}
*/
// call twitter_api: $url with parameters in $query 
function get_twitter_jason($url, $query, $method)
{
	/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
	$oauth_setting = array(
	    'oauth_access_token' => "124550903-P5cFrCmxjzQ3ZEjoEBhjtJDvG8XDs2vMNqx1Sa6m",
	    'oauth_access_token_secret' => "ANwGic7cLhLF43HE0574brsNlRSBsnCBF2v8Eyzp8",
	    'consumer_key' => "6hoHM2l9nAZgAfObSKY9Yg",
	    'consumer_secret' => "Syk7LriJqjwgSNK5UtcCsy8OI7orFx8Z5BdvgKQtvk"
	);

	$oauth = array(
		'oauth_consumer_key' => $oauth_setting['consumer_key'],
		'oauth_token' => $oauth_setting['oauth_access_token'],
		'oauth_nonce' => (string)mt_rand(), // a stronger nonce is recommended
		'oauth_signature_method' => 'HMAC-SHA1',
		'oauth_timestamp' => time(),
		'oauth_version' => '1.0'
		);

	$oauth = array_map("rawurlencode", $oauth); // must be encoded before sorting
	$query = array_map("rawurlencode", $query);

	$arr = array_merge($oauth, $query); // combine the values THEN sort

	asort($arr); // secondary sort (value)
	ksort($arr); // primary sort (key)

	// http_build_query automatically encodes, but our parameters
	// are already encoded, and must be by this point, so we undo
	// the encoding step
	$querystring = urldecode(http_build_query($arr, '', '&'));

	// mash everything together for the text to hash
	$base_string = $method."&".rawurlencode($url)."&".rawurlencode($querystring);

	// same with the key
	$composite_key = rawurlencode($oauth_setting['consumer_secret'])."&".rawurlencode($oauth_setting['oauth_access_token_secret']);

	// generate the hash
	$signature = rawurlencode(base64_encode(hash_hmac('sha1', $base_string, $composite_key, true)));

	$oauth['oauth_signature'] = $signature; // don't want to abandon all that work!
	ksort($oauth); // probably not necessary, but twitter's demo does it

	$oauth = array_map("add_quotes", $oauth);

	// this is the full value of the Authorization line
	$auth = "OAuth " . urldecode(http_build_query($oauth, '', ', '));

	// this time we're using a normal GET query, and we're only encoding the query params
	// (without the oauth params)
	$url .= "?".http_build_query($query);
	$url = str_replace("&amp;","&",$url); //Patch by @Frewuill

	// if you're doing post, you need to skip the GET building above
	// and instead supply query parameters to CURLOPT_POSTFIELDS
	$options = array( CURLOPT_HTTPHEADER => array("Authorization: $auth"),
	                  //CURLOPT_POSTFIELDS => $postfields,
	                  CURLOPT_HEADER => false,
	                  CURLOPT_URL => $url,
	                  CURLOPT_RETURNTRANSFER => true,
	                  CURLOPT_SSL_VERIFYPEER => false);

	$feed = curl_init();
	curl_setopt_array($feed, $options);
	$json = curl_exec($feed);
	curl_close($feed);

	//$twitter_data = json_decode($json);
	return $json;
}

// also not necessary, but twitter's demo does this too
function add_quotes($str) 
{
	return '"'.$str.'"';

}

echo get_twitter_jason($url, $query, $method);

?>
