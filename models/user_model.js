var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  birthdate: {
    type: String,
    default: '',
    required: true
  },
  country: {
    type: String,
    default: '',
    required: true
  },
  display_name: {
    type: String,
    default: '',
    required: true
  },
  email: {
    type: String,
    default: '',
    required: true
  },
  external_urls: {
    spotify: {
      type: String,
      default: '',
      required: true
    }
  },
  id: {
    type: String,
    default: '',
    required: true
  },
  images_url: {
    type: String,
    default: '',
    required: true
  },
  product: {
    type: String,
    default: '',
    required: true
  },
  type: {
    type: String,
    default: '',
    required: true
  },
  uri: {
    type: String,
    default: '',
    required: true
  }
});

module.exports = mongoose.model('user', schema);
