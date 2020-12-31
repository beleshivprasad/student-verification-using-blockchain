const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    verified : {
        type : Boolean
    },
    createdOn:{
        type:Date,
        default:Date.now()
    }
});

module.exports = new mongoose.model('user', userschema);
