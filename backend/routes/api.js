const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const dotenv = require('dotenv')
const Movie = require('../models/movie');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
var url = require('url');

dotenv.config();
console.log('env: ', process.env.SECRET);
mongoose.Promise = global.Promise;
mongoose.connect( process.env.DB_CONNECT ,{ useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err) {
        console.error("Error" + err);
    }
});

router.use(function(req, res, next){
    if(req.url != '/login' && req.url != '/registerUser'){
        const token = req.headers.authorization;
        jwt.verify(token, process.env.SECRET, function(err, decoded){
            if(err){
                res.status(200).json({success: false, status: 301, msg:'Token expired.'});
            }
            else{
                next();
            }
        });
    }
    else{
        next();
    }
})


//Login
router.post('/login', (req, res) => {
    const username = req.body.user_name;
    const password = req.body.password;
    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if (!user){
            return res.json({ success: false, msg: "User not found" });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                const token = jwt.sign(user.toJSON(), process.env.SECRET , { expiresIn: 3600 });
                return res.json({
                    success: true, token: token, user: {
                        id: user.id,
                        userName: user.user_name,
                        password: user.password,
                    }
                });
            } else { return res.json({ success: false, msg: "Wrong Password" }); }
        })
    })
});


router.post('/registerUser', function(req, res){
    User.getUserByUsername(req.body.user_name, function (err, data) {
        console.log("user found: ", data);
        if (err) {
            console.log('Error signup user' + err);
        }
        else{           
            if(!data){
                var newUser = new User();
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.user_name = req.body.user_name;
                        newUser.is_email_confirmed = false;
                        newUser.created_on = new Date();
                        newUser.user_type = '2';
                        newUser.save(function (err, registeredUser) {
                            if (err) {
                                res.json({success: false, msg: 'Error registering user' + err});
                            }
                            else {
                                res.json({success: true, msg:'You are  registered successfully. Use your credentials for login.', registeredUser});
                            }
                        });
                    });
                });
            }
            else {
                res.json({success: false, msg:'User already exist'});
            }
        }
    });
});

router.get('/get_movies', function(req,res){
    var parts = url.parse(req.url, true);
    const query = parts.query;
    Movie.getMoviesByUserId(query.user_id, (err, movies)=>{
        if(err){
            res.json({success: false, msg: err})
        }
        else{
            res.json({success: true, movies });
        }
    });
});
  

router.post('/add_movie', function(req, res) {

    var movie = new Movie();
    movie.name = req.body.name;
    movie.quality = req.body.quality;
    movie.uploaded_by = req.body.upload_by
    movie.save(function (err, addedMovie) {
        if(err){
            res.json({succes: false, msg: 'Error adding Movie' + err});
        }
        else{
            res.json({ success: true, data: addedMovie, msg: 'movie added successfully'});;
        }
    });
});

module.exports = router;