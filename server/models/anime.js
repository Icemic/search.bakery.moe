var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Anime = new Schema({
  title:  String,
  alias: [String],
  vector: [Number],
  keywords: [String],
  rank: Number,
  type: String,
  episode: String,
  cover: String,
  bgmid: Number,
  meta: {
    views: {
      type: Number,
      default: 0
    },
    stars:  {
      type: Number,
      default: 0
    }
  }
});

module.exports = mongoose.model('anime', Anime);
