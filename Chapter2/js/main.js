/**
* I Love Ham
* @author: Rocco Augusto
* @file: js/main.js
**/

var correct = '';
var choice = '';
var max = 0;
var tweets = [
	['I love ham','Earthquake in Japan', 'I just hit an opossum'],
	['Android is awesome', 'I just hit an opossum'], 
	['Ice cream sandwich','I fell out of my hammock', 'swagbucks'], 
];

// this function will grab a random user from
// the tweets array.
function getRandom() {
	var l = tweets.length; // grab length of tweet array
	var ran = Math.floor(Math.random()*l); // grab random user

	return tweets[ran];
}

// grab the user avatars for users in currentRound array
function buildQuiz()
{
	var h = '';

	for(i=0; i<choice.length; i++)
	{
		// crete the html that will be injected into the game screen
		h += '<li>';
		h += ' <blockquote>' + choice[i] + '</blockquote>';
		h += '</li>';
	}

	$('ul').html(h);
	console.log('in buildQuiz');
}

function init()
{
	window.scrollTo(0, 1);
	
	//reset the correct answer
	correct = [];
	choice = getRandom();
	$('ul, section').removeClass();
	$('ul').empty();

	//'https://api.twitter.com/1.1/search/tweets.json?q=choice[x]&count=100',
	host = 'api.twitter.com';
	path = '/1.1/search/tweets.json';
	url = "https://" + host + path;

	//find out which item has more search results 
	max = 0;
	for(i=0; i<choice.length; i++)
	{
		// twitter API sux, u have to replace the spaces in string with '-'. or it reports: 'could not authenticate you'
		$.getJSON(
			"http://localhost:8080/mobile_app/twitter_api_request.php?"
			+ "url=" + url
			+ "&q=" + choice[i].replace(/\s/g,'_')
			+ "&count=100",
			function(data) {
				//check the length of results for each search
				//then set them to the "correct" variable
				console.log(data);
				if (data['statuses'].length)
				{
					length = data['statuses'].length;
					correct.push(length);
					if (max < length)
						max = length;
				}
			});
	}

	// generate the buttons for this round
	buildQuiz();
}

function showResults()
{
	$( "ul li" ).each(
		function( index ) 
		{
			org = $(this).text();
			$(this).text(org + ' : ' + correct[index]);
		});
}

$(function(){
	// run the init() function and start the application
	init();

	// check for correct user on user selection
	$(document).on('click', 'ul li', 
//	$('ul li').on('click', 
		function()
		{
			var id = $(this).index();

			// some data not back from server yet
			if (correct.length < $('ul li').length)
				return;

			// restart the game if game over
			if($('ul').hasClass('gameover'))
			{
				$('h2').text('Which one of these fabulous tweet has more search results?!');
				init();
			}
			else
			{
				if(correct[id] == max)
				{
					//	congrats
					result = 'congratulates! You are a total rock star!';
					$('section:eq(' + id + ')').addClass('win');
				}
/*				else if( correct[id] == correct[not])
				{
					// it's a tie
					result = 'It is a tie! You are a winner by default !';
				}
*/				else
				{
					result = "Boo! You failure! ";
					$('section:eq(' + id + ')').addClass('fail');
				}
				// show answers
				showResults();
				// add gameover class to page
				$('ul').addClass('gameover');
				$('h2').text(result + ' Tap a button to play again.')
			}
		});
});