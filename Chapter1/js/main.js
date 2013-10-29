/**
* Who's That Tweet
* @author: Rocco Augusto
* @file: js/main.js
**/

/* This array holds a list of verified
Twitter accounts that we will use
to pull in random tweets for each
round
*/
var defaultIcon = 'https://si0.twimg.com/sticky/default_profile_images/default_profile_3_normal.png';
var currentRound = [];
var correct = '';
var tweets = [
				'jimmyjohns',
				'sugarsammyk',
				'wilw',
				'JeriLRyan',
				'pattonoswalt',
				'trutriciahelfer',
				'AndrewWK',
				'ChristianKane01',
				'charliesheen',
				'levarburton',
				'edwardjolmos',
				'Rosie',
				'kevinrose',
				'jason',
				'leolaporte',
				'aplusk',
				'StacyKeibler',
				'LilianGarcia',
				'nicolerichie',
				'rainnwilson',
				'ericschmidt',
				'pennjillette',
				'nerdist',
				'Scobleizer'
			];

// this function will grab a random user from
// the tweets array.
function getRandom() {
	var l = tweets.length; // grab length of tweet array
	var ran = Math.floor(Math.random()*l); // grab random user

	// check if randomly selected user is in list
	if(currentRound.indexOf(tweets[ran]) == -1) {
		if(currentRound.length === 0)
			correct = tweets[ran]; // make first random user the correct user

		//push random user to currentRound array
		currentRound.push(tweets[ran]);

		// grab three additional random users
		if(currentRound.length < 4)	getRandom();
	}
	else {
		// if random user is already in list then start over
		getRandom();
	}
}

// grab the user avatars for users in currentRound array
function buildQuiz()
{
	var l = currentRound.length;
	host = 'twitter.com';

	for(i=0;i<l;i++)
	{
		host = 'api.twitter.com';
		path = 	'/1.1/users/show.json';
		url = "https://" + host + path;

		// get user information to display
		$.getJSON(
			"http://localhost:8080/mobile_app/twitter_api_request.php?"
			+ "url=" + url
			+ "&screen_name=" + currentRound[i], 
			function(data)
			{
				console.log('length :'+data.length);
				var img = data['profile_image_url'];
				var h = '';

				// crete the html that will be injected into the game screen
				h += '<li rel="' + data['screen_name'] + '">';
				h += ' <div class="avatar"><img src="' + img + '" alt="" /></div>';
				h += ' <div class="person">' + data['name'] + '</div>';
				h += '</li>';
				// add users and images to page
				$('section ul').append(h);
			});
	}
}

function init()
{
	//reset the correct answer and currentRound array
	correct = '';
	currentRound = [];
	$('ul, section').removeClass();
	$('ul').empty();
	// Get random users and set correct one
	getRandom();

	//display the default twitter account icon
	$('#tweet .avatar').html('<img src="' + defaultIcon + '" alt="" />');

	//grab a random tweet from the correct user
	//'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=twitterapi&count=2',
	host = 'api.twitter.com';
	path = '/1.1/statuses/user_timeline.json';
	url = "https://" + host + path;

	$.getJSON(
		"http://localhost:8080/mobile_app/twitter_api_request.php?"
		+ "url=" + url
		+ "&screen_name=" + correct
		+ "&count=10",
		function(data) {
		
			var ran = Math.floor(Math.random()*data.length);
	        // log a message to the console
			console.log('length :'+data.length);
			console.log('ran:' +data[ran].text);
			$('#tweet .content').html(data[ran].text);
			// randomize the currentRound array so the correct user isnt always first
			currentRound.sort(
				function() { return 0.5 - Math.random(); }
				);
			// grab avatars and display usernames
			buildQuiz();
		});


    // callback handler that will be called on success
/*
    request.done(function (response, textStatus, jqXHR){
        // log a message to the console
        console.log("Hooray again, it worked!");
    });

    // callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // log the error to the console
        console.error(
            "The following error occured: "+
            textStatus, errorThrown
        );
    });

    // callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // reenable the inputs
        //alert("always");
    });
  */
}

$(function(){
	// run the init() function and start the application
	init();
	// check for correct user on user selection
	$(document).on('click', 'ul li', 
		function()
		{
			var name = $(this).attr('rel');
			var img = $('li[rel="' + correct + '"] img').attr('src');
			var score = $('.score span');

			// restart the game if game over
			if($('ul').hasClass('gameover'))
			{
				init();
			}
			else
			{
				// swap out default avatar for correct avatar
				$('#tweet .avatar img').attr('src', img);
				if(name == correct)
				{
					score.text(parseInt(score.text())+100);
					$('section').addClass('win');
				}
				else
				{
					$('section').addClass('fail');
				}
				// add gameover class to page
				$('ul').addClass('gameover');
			}
		});
});