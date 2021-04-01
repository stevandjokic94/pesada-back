const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);