const mongoose = require('mongoose');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		maxlength: 32
	},
	surname: {
		type: String,
		trim: true,
		maxlength: 32
	},
	phone: {
		type: String,
		trim: true,
		required: true,
		maxlength: 15
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	street: {
		type: String,
		trim: true,
		required: true,
		maxlength: 64
	},
	homeNumber: {
		type: String,
		trim: true,
		required: true,
		maxlength: 8
	},
	postalCode: {
		type: String,
		trim: true,
		required: true,
		maxlength: 16
	},
	city: {
		type: String,
		trim: true,
		required: true,
		maxlength: 32
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: String,
	//1 ADMIN, 0 FIZICKO LICE, 2 PRAVNO LICE
	role: {
		type: Number,
		default: 0
	},
	contactPerson: {
		type: String,
		trim: true,
		maxlength: 32
	},
	company: {
		type: String,
		trim: true,
		maxlength: 32
	},	
	pib: {
		type: String,
		trim: true,
		maxlength: 32
	},
	history: {
		type: Array,
		default: []
	},
	isActive: {
		type: Boolean,
		default: false
	},
	passwordToken: String,
  passwordTokenExpires: Date
}, { timestamps: true });

//virtual field
userSchema.virtual('password')
	.set(function(password){
		this._password = password;
		this.salt = uuid();
		this.hashed_password = this.encryptPassword(password);
	})
	.get(function(){
		return this._password;
	});

	userSchema.methods = {
		authenticate: function(plainText){
			return this.encryptPassword(plainText) === this.hashed_password;
		},
		encryptPassword: function(password){
			if(!password) return '';
			try{
				return crypto.createHmac('sha1', this.salt)
					.update(password)
					.digest('hex');
			}
			catch(err){
				return '';
			}
		}
	};

	module.exports = mongoose.model('User', userSchema);