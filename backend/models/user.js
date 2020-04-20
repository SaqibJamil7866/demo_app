const mongoos = require('mongoose');
var bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const schema = mongoos.Schema;
const userSchema = new schema({
    user_name: String,
    password: String,
    user_type: String,
    created_on: Date,
    is_active: Boolean,
    is_email_confirmed: Boolean,
});
const User = module.exports = mongoos.model('user', userSchema);

module.exports.comparePassword = function (candidatePassword, hash, callback) {

    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
    
}

module.exports.getUserByUsername = function (username, callback) {
    const query = { user_name: username }
    User.findOne(query, callback);
}