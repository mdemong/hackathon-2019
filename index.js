const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');

function getConnection() {
	return mysql.createConnection({
		host	: 'localhost',
		user	: 'root',
		password: 'Something0clever.',
		database: 'hackathon'
	});
}

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.get('/', function(req, res){
	res.send("Testing... Try a different URL?");
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

app.listen(3000);