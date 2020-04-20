const mongoos = require('mongoose');
const schema = mongoos.Schema;
const movieSchema = new schema({
    name: String,
    quality : String,
    uploaded_by: String
});
const Movie = module.exports = mongoos.model('movie', movieSchema);


module.exports.getMoviesByUserId = function (user_id, callback) {
    const query = { uploaded_by: user_id }
    Movie.find(query, callback);
}