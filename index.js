require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const { body } = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');

const { index, request } = require('./controllers/index.js');

const app = express();
const router = express.Router();

// use modules
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(session({
    secret: 'faucet',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());


router.get('/', index);

router.post('/request', request);

app.use('/', router);

app.listen(process.env.PORT || 3000);

console.log('Web Server is listening at port '+ (process.env.PORT || 3000));