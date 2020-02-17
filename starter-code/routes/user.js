'use strict';
const express = require('express');
const router = new express.Router();

const User = require('./../models/user.js');

const bcryptjs = require('bcryptjs');

//Middleware requirement
const isSignedIn = require('./../middleware/is-signed-in');

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  // res.redirect('/');
  const { username, password } = req.body;
  // console.log(req.body);
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        username,
        password: hash
      });
    })
    .then(user => {
      console.log('Created user', user);
      //   req.session.user = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.get('/log-in', (req, res, next) => {
  res.render('log-in');
});

router.post('/log-in', (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  let userId;
  User.findOne({ username })
    .then(user => {
      if (user) {
        userId = user._id;
        return bcryptjs.compare(password, user.password);
      } else {
        return Promise.reject(new Error('Username does not exist.'));
      }
    })
    .then(response => {
      if (response) {
        console.log('user has loggedin');
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.get('/main', isSignedIn, (req, res, next) => {
  res.render('main-private');
});

router.get('/private', isSignedIn, (req, res, next) => {
  res.render('private');
});

router.get('/profile', isSignedIn, (req, res, next) => {
  res.render('profile');
});

router.post('/private/edit', isSignedIn, (req, res, next) => {
  const user = req.session.user;
  User.findByIdAndUpdate(user, {
    username: req.body.username
  })
    .then(userUpdate => {
      console.log(userUpdate);
      res.redirect('/user/profile');
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
