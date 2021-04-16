var express = require('express');
var multer = require('multer');
var app = express();
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http').Server(app);
var mysql = require('mysql');
var fs = require('fs');
var PDFDocument = require('pdfkit');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var crypto = require('crypto');
var formidable = require('formidable');
var url = require('url');
var QB = require('quickblox');
var ical = require('ical-generator');
const Razorpay = require("razorpay");
//const cons = require("consolidate");
const qs = require("querystring");

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
// var router = express.Router();

var FCM = require('fcm-push');

const sharp = require('sharp');
const router = new express.Router
app.use(router)

var serverKey ='AAAAaDLH7ng:APA91bF9L9Pq03AaZPuhCOu9XEAR1FERVK6xMycUPaApb2ERr_cF7M8HY8YRjVp7_BHnCyL8-MLvOVzMeJsfYoBamnVk3N6Yq01ogC5AC-BCfz_MRedq0RO8N6T4QZGg3W3fazzz3TrA';


var QuickBlox = require('quickblox').QuickBlox;
var QB1 = new QuickBlox();
var QB2 = new QuickBlox();


var fcm = new FCM(serverKey);



var MongoClient = require('mongodb').MongoClient;


//var prompt = require('prompt');

app.set('port', process.env.PORT || 4000);/* 7000 */
//app.set('port', process.env.PORT);
// app.set('views', __dirname + '/views');
// app.set('view engine', 'pug');

var port    = process.env.PORT || 4000,
    //app 	= require('express')(),
	//http 	= require('http').Server(app),
	io 		= require('socket.io')(http);



// Allow CORS support and remote requests to the service
app.use(function(req, res, next)
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    next();
});




//app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'uwotm8' }));

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
//app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(express.static(path.join(__dirname ,'public')));
app.use(express.static(path.join(__dirname ,'www')));
//app.use(express.static(path.join(__dirname, 'another')));
// app.use(express.bodyParser({limit: '50mb'}));

app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))

app.use(function(req,res, next){
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

console.log(__dirname);


var sqlInfo = {
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'stock'
};

var con;

function handleDisconnect()
{
	con = mysql.createConnection(sqlInfo);

	con.connect(function(err)
	{
	  if(err){
		console.log('Error connecting to Db');
		console.log(err);
		return;
	  }
	 
	  console.log('Connection established');
	});
	
	con.on('error', function(err) {
		console.log('db error 1', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') // Connection to the MySQL server is usually
		{											// lost due to either server restart, or a
		  handleDisconnect();                       // connnection idle timeout (the wait_timeout
		} else {                                    // server variable configures this)
		  console.log('db error 2', err);
		}
	});
}

handleDisconnect();




//SendGrid Configuration
var sgoptions = {
    auth: {
        api_key: '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'
    }
};

var transporter = nodemailer.createTransport(sgTransport(sgoptions));



/******************** SERVER API *********************/
app.get('/', function(req,res) {	
	var ord = JSON.stringify(Math.random()*1000);
	var i = ord.indexOf('.');
	ord = 'ORD'+ ord.substr(0,i);	
	res.render(__dirname + '/index.html', {orderid:ord});
	
});

app.post('/get_company',function(req,res)
{
		
	var query_string = 'SELECT * FROM company_list';
	con.query(query_string,function(err,rows)
	{
		if(err)
		{
			console.log(err);
			res.sendStatus(500);
		}
		else
		{
			res.send(rows);
		}
	})
	
})

app.post('/get_company_details',function(req,res)
{
	var company_id = req.body.company_id;
	var query_string = 'SELECT * FROM companies_details WHERE company_id="'+company_id+'"';
	con.query(query_string,function(err,rows)
	{
		if(err)
		{
			console.log(err);
			res.sendStatus(500);
		}
		else
		{
			res.send(rows);
		}
	})
	
})



// Instruct node to run the socket server on the following port
http.listen(port, function()
{
  console.log('listening on port ' + port);
});

/*************  Coupal SOCKET  ******************/