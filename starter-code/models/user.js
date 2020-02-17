'use strict';

// User model goes here
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        strict: true
    },
    password:{
        type:String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;


