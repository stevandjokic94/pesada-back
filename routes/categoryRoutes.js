const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const { userById } = require('../controllers/userController');

router.post('/category/create/:userId', 
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	categoryController.createCat);
router.post('/subcategory/create/:userId', 
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	categoryController.createSubcat);
router.get('/category/:categoryId', 
	categoryController.readCat);
router.get('/subcategory/:subcategoryId', 
	categoryController.readSubcat);
router.put('/category/:categoryId/:userId', 
	categoryController.updateCat);
router.put('/subcategory/:subcategoryId/:userId', 
	categoryController.updateSubcat);
router.delete('/category/:categoryId/:userId', 
	categoryController.deleteCat);
router.delete('/subcategory/:subcategoryId/:userId', 
	categoryController.deleteSubcat);
router.get('/categories', 
	categoryController.listCat);
router.get('/subcategories', 
	categoryController.listSubcat);
router.get('/subcategories/:categoryId', 
	categoryController.listSubcatByCat);

router.param('userId', userById);
router.param('categoryId', categoryController.categoryById);
router.param('subcategoryId', categoryController.subcategoryById);

module.exports = router;