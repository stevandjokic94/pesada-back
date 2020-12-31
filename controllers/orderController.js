const {Order, CartItem} = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('../helpers/mailHelpers');
const { errorHandler } = require('../helpers/dbErrorHandler');
const { getInvoiceData } = require('../helpers/invoiceHelpers');
const fs = require("fs");
const PDFDocument = require("pdfkit");


exports.create = async(req, res) => {
	const order  = req.body.order;
	//0 je za FIZICKO LICE 2 ZA PRAVNO
	if(order.role === 0){
		if(!order.name || !order.surname || !order.email 
			|| !order.phone || !order.street 
			|| !order.homeNumber || !order.postalCode 
			|| !order.city || !order.products){
				return res.status(400).json({
					error: 'Neko od obaveznih polja nije popunjeno!'
				});
		}
	}
	else{
		if(!order.name || !order.company || !order.email 
			|| !order.phone || !order.street 
			|| !order.homeNumber || !order.postalCode 
			|| !order.city || !order.products || !order.pib || !order.contactPerson){
				return res.status(400).json({
					error: 'Neko od obaveznih polja nije popunjeno!'
				});
		}
	}
	// console.log(order);
	if(!order.agreed){
		return res.json({
			error: 'Morate prihvatiti uslove korišćenja'
		});
	}

	// const orderParams = {
	// 	user: {

	// 	}
	// };
	console.log(req.body.order);
	const orderObject = await(new Order(req.body.order));
	// console.log(orderObject);
	await orderObject.save();
	// console.log(req.body.order);
	await User.findOne({
		email: req.body.order['email']
	}, (err, user) => {
			if(err){
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			
			const products = req.body.order.products;
			const price = products.reduce((acc, element) => {
				return (acc + element.priceWithDiscount * element.count + element.weightPrice);
			}, 0);
			const text = `Hvala na porudžbini!\nNaručili ste proizvode sa ukupnom cenom od ${price}`;
			
			if(user && order.signedIn){
				//save to history
				user.history.unshift(req.body.order.products);
				user.save();
				//send email confirmation
				sendEmail(user, 'Potvrda kupovine', text);
			}
			else{
				sendEmail(req.body.order, 'Potvrda kupovine', text);
			}

			res.json({ user });
		});
};

exports.listProcessedOrders = async(req, res) => {
	await Order.find({
		status:"Obradjeno"
	}).sort('-created')
		.limit(10)
		.exec((error, orders) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		res.json(orders);
	});
};

exports.listUnprocessedOrders = async(req, res) => {
	await Order.find({
		status:"Nije obradjeno"
	}).sort('-created').exec((error, orders) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		res.json(orders);
	});
};

exports.getStatusValues = (req, res) => {
	res.json(Order.schema.path('status').enumValues);
};

exports.updateStatus = async(req, res) => {
	await Order.findOneAndUpdate({
		_id: req.body.orderId
	}, {
		status: "Obradjeno"
	}, {
	  new: true,
	  upsert: true,
	  rawResult: true // Return the raw result from the MongoDB driver
	}, (error, order) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		return res.json({
			msg: 'Uspesan update narudzbine!'
		});
	});
};

exports.delete = async(req, res) => {
	const id = req.body.orderId;
	await Order.findByIdAndDelete(
		id, (error) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		return res.json({
			msg: 'Uspesno obrisana narudzbina!'
		});
	});
};

exports.update = async(req, res) => {
	const order = await Order.findById(req.body.orderId);
	// console.log(req.body.products);
	const updateParams = req.body.products;
	// console.log(updateParams);
	await Order.findOneAndUpdate({
		_id: req.body.orderId
	}, {
			products: updateParams
	}, {
	  new: true,
	  upsert: true,
	  rawResult: true // Return the raw result from the MongoDB driver
	}, (error, order) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		// console.log(order);
		return res.json({
			msg: 'Uspesan update narudzbine!'
		});
	});
};

exports.order = async(req, res) => {
	await Order.findById(req.body.orderId, (error, order) => {
		if(error)
			return res.status(400).json({
				error: errorHandler(error)
			});
		console.log(order);
		return res.json(
			order
		);
	});
};

exports.userOrders = async(req, res) => {
	let user = await User.findOne({_id:req.orderId});
	console.log(user);
	res.json({'message': 'ok'});
};

exports.contactUs = async(req, res) => {
	console.log(req.name);
	const user = {'email': 'stevandjokic94@live.com'};
	const text = `Ime: ${req.body.name}\nEmail: ${req.body.email}\nBroj telefona: ${req.body.number}\nPoruka: 	${req.body.text}`;
	sendEmail(user, 'Kontakt', text);
	res.json({'message': 'Email poslat'});
};