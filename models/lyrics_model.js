var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  artist: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  },
  lyrics: {
    type: String,
    default: null
  },
  desc: {
    type: String,
    default: null
  },
  report: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('lyrics', schema);
