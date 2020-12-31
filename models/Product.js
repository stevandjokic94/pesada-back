const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		maxlength: 32,
		unique: true
	},
	description: {
		type: String,
		required: true,
		maxlength: 2000
	},
	price: {
		type: Number,
		trim: true,
		required: true,
		maxlength: 32
	},
	priceWithDiscount: {
		type: Number,
		trim: true,
		default: 0,
		maxlength: 32
	},	
	discount: {
		type: Number,
		trim: true,
		default: 0,
		maxlength: 32
	},
	subcategory: {
		type: ObjectId,
		ref: 'Subcategory',
		required: true
	},
	weight: {
		type: Number,
		default: 290
	},
	weightPrice: {
		type: Number,
	},
	gallery: [{
		type: ObjectId,
		ref: 'Photo',
		required: true
	}],
	photo: {
		data: Buffer,
		contentType: String
	},
	tags:[{
		type: String
	}],
	hide: {
		type: Boolean,
		default: false
	},
	sold:{
		type: Number,
		default: 0
	},
	shipping:{
		type: Boolean,
		default: false
	},
	selected:{
		type: Boolean,
		default: false
	},
	size:{
		type: String,
	},
	code:{
		type: String,
	}
}, { timestamps: true });

productSchema.pre('save', async function(next) {
  if(this.weight < 2)
  	this.weightPrice = 290;
  if(this.weight >= 2 && this.weight < 5)
  	this.weightPrice = 390;
  if(this.weight >= 5 && this.weight < 10)
  	this.weightPrice = 590;
  if(this.weight >= 10 && this.weight < 20)
  	this.weightPrice = 790;
  if(this.weight >= 20 && this.weight < 50)
  	this.weightPrice = 1190;
  if(this.weight >= 50)
  	this.weightPrice = 1490;

  let num = await this.constructor.find().length;
  if(num >= 1000000)
  	num = 10000000;
  else num = 1000000;


  let code = Math.floor(Math.random() * num).toString();
	const n = code.length;
	let zeros = "";

	for(let i = 0;i < num.length - n; i++){
		zeros += "0";
	}
	let newCode = zeros + code;
	let productWithCode = await this.constructor.findOne({ newCode });

	while(productWithCode){
		code = Math.floor(Math.random() * num).toString();
		productWithCode = await this.constructor.findOne({ newCode });
	}
	this.code = newCode;

  next();
});

module.exports = mongoose.model('Product', productSchema);