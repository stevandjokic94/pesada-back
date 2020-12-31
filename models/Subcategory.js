const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const subcategorySchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		maxlength: 64,
		unique: true
	},
	category: {
		type: ObjectId,
		ref: 'Category',
		required: true
	}
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);