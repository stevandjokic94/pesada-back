const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const { userById } = require('../controllers/userController');

router.post('/product/create/:userId', 
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	productController.create);
router.get('/product/:productId', productController.read);
router.delete('/product/:productId/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	productController.remove
);
router.put('/product/:productId/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	productController.update
);
router.get('/products', productController.listProducts);
router.get('/products/all', productController.listAllProducts);
router.get('/products/selected', productController.listSelectedProducts);
router.get('/products/discount', productController.listDiscountProducts);
router.get('/products/related/:productId', 
	productController.listRelated
);
router.get('/products/categories', 
	productController.listCategories
);
router.post('/products/by/search', 
	productController.listBySearch
);
router.post('/products/search', 
	productController.listSearchResults
);
router.get('/product/photo/:productId',
	productController.photo
);
router.get('/product/photo-from-gallery/:photoId',
	productController.photoFromGallery
);
router.get('/product/gallery/:productId',
	productController.gallery
);
router.post('/products/searchResults', 
	productController.listBySearchResults
);

router.param('userId', userById);
router.param('photoId',productController.photoById);
router.param('productId',productController.productById);

module.exports = router;