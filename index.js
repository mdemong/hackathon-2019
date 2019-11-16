const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const vision = require('./vision.js');

function getConnection() {
	return mysql.createConnection({
		host	: 'localhost',
		user	: 'root',
		password: 'Something0clever.',
		database: 'hackathon'
	});
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

app.set('view engine', 'pug');
app.set('views', './views');

app.use(session({secret: "I guess we need a secret for some reason?"}));

app.use(fileUpload());

// for parsing application/json
console.log(__dirname)
app.use(express.static('views'));
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.get('/', function(req, res){
	res.render("start")
});

app.get('/test_list', function(req, res) {
	var list = [];

	var connection = getConnection();
	connection.connect();

	connection.query('select * from sample_cards', function(err, rows, fields) {
		if (err) { throw err; }
		else {
			for (var i = 0; i < rows.length; i++) {
				var card = {
					'id' : rows[i].id,
					'front' : rows[i].front,
					'back' : rows[i].back
				}
				list.push(card);
			}
			res.render('test_list', {"list" : list});
		}
	})
	connection.end();
});

app.get('/sample_quiz', function(req, res) {
	var deck = [];

	var connection = getConnection();
	connection.connect();

	connection.query('select max(id) as max from sample_cards', function(err, rows, fields) {
		if (err) { throw err; }
		else {
			var numCards = rows[0].max;
			req.session.maxIndex = numCards - 1;
		}
	})

	connection.query('select * from sample_cards', function(err, rows, fields) {
		if (err) { throw err; }
		else {
			for (var i = 0; i < rows.length; i++) {
				var card = {
					'id' : rows[i].id,
					'front' : rows[i].front,
					'back' : rows[i].back
				}
				deck.push(card);
			}

			// Shuffle the deck
			shuffle(deck);
			// Record session data
			req.session.index = 0;
			req.session.list_of_cards = deck;
			res.render('quiz', {"list_of_cards" : deck, "index" : req.session.index, "maxIndex": req.session.maxIndex});
		}
	})
	connection.end();
});

app.post('/prev_card', function(req, res) {
	req.session.index--;
	res.render('quiz', {"list_of_cards" : req.session.list_of_cards, "index" : req.session.index, "maxIndex": req.session.maxIndex});
});

app.post('/next_card', function(req, res) {
	req.session.index++;
	res.render('quiz', {"list_of_cards" : req.session.list_of_cards, "index" : req.session.index, "maxIndex": req.session.maxIndex});
});

app.post('/upload', function(req, res) {
	if (!req.files || Object.keys(req.files).length === 0) {
    	return res.status(400).send('No files were uploaded.');
 	}

 	let note_file = req.files.note_file;

 	// TODO: Handle file uploading.
	
	note_file.mv('./temp', async function(err) {
		if (err) return res.status(500).send(err);

		let cards = await vision.getCards('./temp');
		req.session.list_of_cards = cards;
		req.session.index = 0;
		req.session.maxIndex = cards.length - 1;
		res.render('quiz', {"list_of_cards" : cards, "index" : req.session.index, "maxIndex": req.session.maxIndex});
		//res.send("File accepted. You submitted: " + note_file.name);
	})


});

app.listen(3000);