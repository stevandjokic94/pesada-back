const easyinvoice = require('easyinvoice');
const fs = require('fs');
const moment = require('moment');

exports.getInvoiceData = async(order) => {
	moment.locale('sr');
	let dataProducts = [];
	order.products.map((product) => {
		dataProducts.push({
			"quantity": product.count,
			"description": product.name,
			"price": product.priceWithDiscount,
			"tax": 0
		});
	});
	let data = {
	    "documentTitle": "", //Defaults to INVOICE
	    "currency": "RSD",
	    "taxNotation": "vat", //or gst
	    "marginTop": 25,
	    "marginRight": 25,
	    "marginLeft": 25,
	    "marginBottom": 25,
	    "logo": "https://i.ibb.co/W2bdLNX/logo-Invoice.png", //or base64
	    //"logoExtension": "png", //only when logo is base64
	    "sender": {
	        "company": "Pesada doo",
	        "address": "Adresa firme 123",
	        "zip": "11500",
	        "city": "Beograd",
	        "country": "Srbija"
	        //"custom1": "custom value 1",
	        //"custom2": "custom value 2",
	        //"custom3": "custom value 3"
	    },
	    "client": {
	       	"company": order.name,
	       	"address": order.street + " " + order.homeNumber,
	       	"zip": order.postalCode,
	       	"city": order.city,
	       	"country": "Srbija",
	        // "custom1": "custom value 1",
	        //"custom2": "custom value 2",
	        //"custom3": "custom value 3"
	    },
	    "invoiceNumber": "2020.0001",
	    "invoiceDate": moment(order.createdAt).format("D MMM YYYY"),
	    "products": dataProducts,
	    "bottomNotice": "Molimo platite u narednih 15 dana."
	};

	const result = await easyinvoice.createInvoice(data);
	// console.log(result);                       
	await fs.writeFileSync("invoice.pdf", result.pdf, 'base64');
	// console.log(dataProducts);
	return data;
};
