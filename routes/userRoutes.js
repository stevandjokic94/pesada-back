const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.get('/secret/:userId', 
	authController.requireSignin, 
	authController.isAuth, 
	(req, res) => {
		res.json({ user: req.profile }
	);
});
router.get('/user/:userId', 
	authController.requireSignin, 
	authController.isAuth, 
	userController.viewProfile
);
router.put('/user/:userId', 
	authController.requireSignin, 
	authController.isAuth, 
	userController.updateProfile
);
router.post('/user/forgot', 
	userController.forgotPassword
);
router.post('/user/password', 
	userController.editPassword
);

router.param('userId', userController.userById);

module.exports = router;