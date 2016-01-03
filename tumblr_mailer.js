//require modules
var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

//read files
var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');

//retrieve config settings/apikeys stored in config file
var config = require('./config.js');

//create tumblr client
var client = tumblr.createClient(config.tumblrAPIKey);

//create mandrill client
var mandrill_client = new mandrill.Mandrill(config.mandrillAPIKey);

//parse the csv file to get contacts, return array of objects
function csvParse(csvFile) {
	//split file by line
	var contents = csvFile.split("\n");

	//remove first line and save it as an array of keys
	var keys = contents.shift().split(',');
	var contactsArr = [];

	for (var i=0; i<contents.length; i++) {
		//ignore if the line is empty
		if (contents[i]!=="") {
			var contactObj = {};
			var contact = contents[i].split(',');

			for (var j=0; j<contact.length; j++) {
				contactObj[keys[j]] = contact[j];
			}

			contactsArr.push(contactObj);
		}
	}

	return contactsArr;
}

//return the most recent posts
function getRecentPosts(posts) {
	var recentPosts = [];
	posts.forEach(function(post){
		var createdAt = new Date(post.date);
		var currentDate = new Date();
		var differenceInMS = currentDate - createdAt;

		//if less than 30 days old
		if (differenceInMS < 86400000*30) {
			recentPosts.push(post);
		}
	})
	return recentPosts;
}

//get all posts from blog
client.posts('jpbcodes.tumblr.com', function(error, response) {
	var templateCopy = emailTemplate;
	var contacts = csvParse(csvFile);
	var allPosts = response.posts;
	var latestPosts = [];
	var recipientList = [];

	//find recent posts
	latestPosts = getRecentPosts(allPosts);

	//generate template for each member of contact list
	for (var i = 0; i<contacts.length; i++) {
		var contact = contacts[i];
		var firstName = contact['firstName'];
		var numMonthsSinceContact = contact['numMonthsSinceContact'];
		var email = contact['emailAddress'];

		//render custom email template
		var customizedTemplate = ejs.render(templateCopy, { firstName: firstName,
																												numMonthsSinceContact: numMonthsSinceContact,
																												latestPosts: latestPosts
		});

		console.log(customizedTemplate);
		
		//pass the customized template and recipient info to sendEmail
		sendEmail(firstName, email, 'Jeremy Bini', 'jeremybini@gmail.com', 'Greetings from Fullstack', customizedTemplate);
	}
});

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Tumblrmailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      console.log(message);
      console.log(result);   
  }, function(error) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + error.name + ' - ' + error.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}










