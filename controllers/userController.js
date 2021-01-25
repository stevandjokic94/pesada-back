const User = require('../models/User');
const { sendEmail } = require('../helpers/mailHelpers');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');

exports.userById = async(req, res, next, id) => {
	await User.findById(id).exec((err, user) => {
		if(err || !user){
			return res.status(400).json({
				error: 'Korisnik nije pronadjen'
			})
		}
		req.profile = user;
		next();
	});
};

exports.viewProfile = (req, res) => {
	req.profile.hashed_password = undefined;
	req.profile.salt = undefined;
	return res.json(req.profile);
};

exports.updateProfile = async(req, res) => {
	await User.findOneAndUpdate(
		{_id: req.profile._id}, 
		{$set :req.body}, 
		{new : true}, 
		(err, user) => {
			if(err){
				return res.status(400).json({
					error: 'Nisi autorizovan da izvedes ovu akciju'
				});
			}
			user.hashed_password = undefined;
			user.salt = undefined;
			return res.json(user);
		}
	);
};

exports.forgotPassword = async (req, res) => {
	await User.findOne({"email": req.body.email}).exec(async(error, user) => {
		if(error || !user){
			return res.status(400).json({
				error: 'Korisnik nije pronadjen'
			})
		}
		let passwordToken = crypto.randomBytes(20).toString('hex');
	  await user.update(
		   {"email": req.body.email},
		   { $set:
		      {
		        passwordToken
		      }
		   }
		);

	  const resetURL = `https://pesada.rs/account/reset/${user.passwordToken}`;
	  console.log('prvi token ', user.passwordToken);
	  sendEmail(
	    user,
			'Promena lozinke',
	    `Vašu lozinku možete promeniti na sledećem linku: \n${resetURL}`
	  );
		res.json({ user });
	});
};

exports.editPassword = async(req, res) => {
	await User.findOne({"passwordToken": req.body.token}).exec(async(error, user) => {
		if(error || !user){
			return res.status(400).json({
				error: 'Korisnik nije pronadjen'
			})
		}
		let hashed_password = await encryptPassword(req.body.password, user);
		console.log(hashed_password);
		await User.update(
		   {"passwordToken": req.body.token},
		   { $set:
		      {
		        hashed_password
		      }
		   }
		);
		res.json({ success: 'asdasd' });
	});
};

const encryptPassword = (password, user) => {
	console.log(user);
	if(!password) return '';
	try{
		return crypto.createHmac('sha1', user.salt)
			.update(password)
			.digest('hex');
	}
	catch(err){
		return '';
	}
}
