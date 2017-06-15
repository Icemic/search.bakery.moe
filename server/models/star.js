var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Star = new Schema({
  base: Number,
  target: Number,
  amount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('star', Star);
