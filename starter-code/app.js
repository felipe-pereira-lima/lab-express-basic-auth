'use strict';

const { join } = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');

const indexRouter = require('./routes/index');
const user = require('./routes/user');

const User = require('./models/user')
const mongoose = require ('mongoose');
const app = express();
const expressSession = require ('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(expressSession);
const hbs = require('hbs');


// Setup view engine
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + "/views/partials");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));
app.use(sassMiddleware({
  src: join(__dirname, 'public'),
  dest: join(__dirname, 'public'),
  outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
  sourceMap: true
}));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie:{
      maxAge: 60*60*24*15, //15 days
      secure: process.env.NODE_ENV !== 'development',
      sameSite: true,
      httpOnly: true,
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60*60*24 //one full day
    })
  })
);

app.use((req,res,next) =>{
  // console.log('im running!')
  const userId = req.session.user;
  console.log(userId);
  if (userId) {
    User.findById(userId)
    .then(signedUser =>{
      console.log('logged in user is', signedUser);
      req.user = signedUser;
      res.locals.user = req.user;
      next();
    })
    .catch(error =>{
      next(error);
    });
  } else {
    next();
  }
});

app.use('/', indexRouter);
app.use('/user', user);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;
