var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  birthdate: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  display_name: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  external_urls: {
    spotify: {
      type: String,
      default: null
    }
  },
  id: {
    type: String,
    default: null
  },
  images_url: {
    type: String,
    default: null
  },
  product: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null
  },
  uri: {
    type: String,
    default: null
  }
}, {
  timestamps: {
    updatedAt: 'lastOnlineAt'
  }
});

module.exports = mongoose.model('user', schema);
