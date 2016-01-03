var fs = require('fs');

var csvFile = fs.readFileSync('friend_list.csv', 'utf8');
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

function csvParse(csvFile) {
	var contents = csvFile.split("\n");
	var keys = contents.shift().split(',');
	var contactsArr = [];

	for (var i=0; i<contents.length; i++) {
		//ignore if empty
		if (!contents[i]=="") {
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

function templateReplacer(template, list) {
	var nameRegEx = /FIRST_NAME/;
	var monthsRegEx = /NUM_MONTHS_SINCE_CONTACT/;

	list.forEach(function(contact) {
		var name = contact.firstName;
		var months = contact.numMonthsSinceContact;
		var configuredEmail = template;

		configuredEmail = configuredEmail.replace(nameRegEx, name);
		configuredEmail = configuredEmail.replace(monthsRegEx, months);

		console.log(configuredEmail);
	});
}

templateReplacer(emailTemplate, csvParse(csvFile));
console.log(csvParse(csvFile));



















