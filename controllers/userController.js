const User = require('../models/User');

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