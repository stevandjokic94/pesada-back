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
	}, async(err, user) => {
			if(err){
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			
			const products = req.body.order.products;
			const price = products.reduce((acc, element) => {
				return (acc + element.priceWithDiscount * element.count);
			}, 0);

			let text = getEmailContent(order);
			text += `\nSADRŽAJ PORUDŽBINE:\n`;

			for(let i = 0; i < order.products.length; i++){
				let product = order.products[i];
				text += `\n\t${i+1}) \tNaziv proizvoda:    ${product.name}\n\t\t  Šifra proizvoda:      ${product.code}\n\t\t  Cena:                      ${formatPrice(product.priceWithDiscount)} din\n\t\t  Količina:                  ${product.count}\n\t\t  Iznos:                      ${formatPrice(product.priceWithDiscount * product.count)}din\n`;
			}
			
			let weightPrice = getWeightPrice(order.products);
			text += `\nCena dostave: ${formatPrice(weightPrice)} din\n\nUKUPNO: ${formatPrice(price + weightPrice)} din\n\n`;
			text += `U slučaju da nešto od proizvoda iz Vaše porudžbine trenutno nije dostupno, kontaktiraće Vas neko od naših operatera radi daljeg dogovora. Za sva dodatna pitanja možete nas kontaktirati putem email adrese: office@pesada.rs`;
			console.log(text);
			let admin = await User.findOne({'name': 'Djordje', 'role':1});
			console.log(admin);
			if(user && order.signedIn){
				//save to history
				user.history.unshift(req.body.order.products);
				user.save();
				//send email confirmation
				sendEmail(user, 'Potvrda kupovine', text);
				sendEmail(admin, 'Potvrda kupovine', text);
			}
			else{
				sendEmail(req.body.order, 'Potvrda kupovine', text);
				sendEmail(admin, 'Potvrda kupovine', text);
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

const getWeightPrice = (products) => {
  let weight = 0;
  for(let i = 0;i < products.length; i++){
    weight += products[i].weight * products[i].count;
  }
  let price = 0;
  if(weight <= 2 && products.length > 0)
    price = 290;
  if(weight > 2 && weight <= 5)
    price = 390;
  if(weight > 5 && weight <= 10)
    price = 590;
  if(weight > 10 && weight <= 20)
    price = 790;
  if(weight > 20 && weight <= 50)
    price = 1190;
  if(weight > 50)
    price = 1490;
  return price;
};

const formatPrice = (price) => {
  return Math.round(price).toLocaleString().replace(/,/g, '.').concat(',00');
};

const getEmailContent = (order) => {
	let text;
	//fizicko lice
	if(order.role === 0){
		text = `Poštovani/a,\nUspešno ste izvršili porudžbinu.\n\nLIČNI PODACI KUPCA:\nIme:            ${order.name}\nPrezime:        ${order.surname}\nBroj telefona:  ${order.phone}\nUlica:          ${order.street}\nBroj:           ${order.homeNumber}\nGrad/Mesto:     ${order.city}\nEmail:          ${order.email}\nNapomena:       ${order.note.length > 0 ? order.note : "/"}\nNAČIN PLAĆANJA: `;
		if(order.paymentMethod === 'cash')
			text += "Gotovinom(prilikom dostave)\n";
		else{
			text += "Preko računa\n";
		}
	}
	else{
		text = `Poštovani/a,\nUspešno ste izvršili porudžbinu.\n\nLIČNI PODACI KUPCA:\nKorisničko ime:  ${order.name}\nNaziv firme:       ${order.company}\nKontakt osoba:  ${order.contactPerson}\nPIB:                    ${order.pib}\nBroj telefona:    ${order.phone}\nUlica:                 ${order.street}\nBroj:                  ${order.homeNumber}\nGrad/Mesto:     ${order.city}\nEmail:                ${order.email}\nNapomena:       ${order.note.length > 0 ? order.note : "/"}\nNAČIN PLAĆANJA: `;
		if(order.paymentMethod === 'cash')
			text += "Gotovinom(prilikom dostave)\n";
		else{
			text += "Preko računa\n";
		}
	}
	return text;
};