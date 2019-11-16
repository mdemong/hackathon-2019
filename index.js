const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');

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

// for parsing application/json
console.log(__dirname)
app.use(express.static('views'));
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.get('/', function(req, res){
	res.render('test_index', {});
	//res.send("Testing... Try a different URL?");
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

	connection.query('select max(id) from sample_cards', function(err, rows, fields) {
		if (err) { throw err; }
		else {
			var numCards = rows[0].id;
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

app.listen(3000);