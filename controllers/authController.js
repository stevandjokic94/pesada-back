const User = require('../models/User');
const jwt = require('jsonwebtoken');//za generisanje sigin tokena
const expressJwt = require('express-jwt');//za autorizaciju
const { errorHandler } = require('../helpers/dbErrorHandler');
const { sendEmail } = require('../helpers/mailHelpers');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.signup = async(req, res) => {
	// console.log(req.body);
	const user = await(new User(req.body));

	user.passwordToken = crypto.randomBytes(20).toString('hex');
  await user.save();

  const resetURL = `http://178.128.206.250/account/confirm/${user.passwordToken}`;
 	sendEmail(user, 'Potvrda email adrese', `Molimo, kliknite na link kako biste verifikovali nalog: ${resetURL}`);
  
	await(user.save((err, user) => {
			if(err){
				return res.status(400).json({
					err: errorHandler(err)
				});
			}
			user.salt = undefined;
			user.hashed_password = undefined;
			
			res.json({ user });
		}));
};

exports.signin = async(req, res) => {
	const { email, password } = req.body;
	await User.findOne({email}, (err, user) => {
		if(err || !user){
			return res.status(400).json({
				error: 'Korisnik sa ovim email-om ne postoji'
			});
		}
		if(!user.authenticate(password)){
			return res.status(401).json({
				error: 'Neispravna lozinka'
			});
		}
		if(!user.isActive){
			return res.status(400).json({
				'error': 'Nalog jos uvek nije verifikovan!'
			});
		}
		//generisi token za signin
		const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
		//nazivam token t za koriscenje
		res.cookie('t', token, { expire: new Date() + 9999 });
		//vrati response sa userom i tokenom
		// const { _id, name, email, role } = user;
		user.salt = undefined;
		user.password = undefined;
		res.json({ token, user });
	});
};

exports.signout = (req, res) => {
	res.clearCookie('t');
	res.json({ message:'Odjavljivanje uspesno' });
};

exports.requireSignin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'auth',
	algorithms: ['sha1', 'RS256', 'HS256'],
});

exports.isAuth = (req, res, next) => {
	let user = req.profile && req.auth && req.profile._id == req.auth._id;
	if(!user){
		return res.status(403).json({
			error: 'Pristup odbijen'
		});
	}
	next();
};

exports.isAdmin = (req, res, next) => {
	if(req.profile.role === 0)
		return res.status(403).json({
			error: 'Admin strana, pristup odbijen'
		})
		next();
};

exports.confirmAccount = async(req, res) => {
	console.log(req.params.token);
	const user = await User.findOne({
		'passwordToken': req.params.token
	});
	user.isActive = true;
	console.log(user);
	await(user.save((err, user) => {
			if(err){
				return res.status(400).json({
					err: errorHandler(err)
				});
			}
			user.passwordToken = '';
			user.salt = undefined;
			user.hashed_password = undefined;
			
			res.json({
				'message': 'Nalog uspesno verifikovan!'
			});
		}));
};