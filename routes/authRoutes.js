const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { userSignupValidator } = require('../validator');

router.post('/signup', userSignupValidator, 
	authController.signup);
router.post('/signin', authController.signin);
router.get('/signout', authController.signout);
router.get('/account/confirm/:token', authController.confirmAccount);

module.exports = router;