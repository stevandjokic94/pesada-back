const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const { userById } = require('../controllers/userController');

router.post('/order/create', 
	orderController.create
);
router.get('/order/processed-list/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.listProcessedOrders
);
router.get('/order/unprocessed-list/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.listUnprocessedOrders
);
router.get('/order/status-values/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.getStatusValues
);
router.post('/order/update-status/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.updateStatus
);
router.delete('/order/delete/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.delete
);
router.post('/order/list-products/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.order
);
router.post('/order/update/:userId',
	authController.requireSignin,
	authController.isAuth,
	authController.isAdmin,
	orderController.update
);
router.get('/orders/:userId',
	authController.requireSignin,
	authController.isAuth,
	orderController.userOrders
);
router.post('/orders/sendEmail',
	orderController.contactUs
);

router.param('userId', userById);
module.exports = router;