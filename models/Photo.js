const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const photoSchema = new mongoose.Schema({
		data: Buffer,
		contentType: String
});

module.exports = mongoose.model('Photo', photoSchema);