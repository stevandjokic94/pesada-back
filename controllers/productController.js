const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/Product');
const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const Photo = require('../models/Photo');
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.productById = async(req, res, next, id) => {
	await Product.findById(id)
	.populate('gallery')
	.populate('subcategory')
	.exec((err, product) => {
		if(err || !product || product.hide){
			return res.status(400).json({
				error: 'Neuspelo učitavanje artikla'
			});
		}

		req.product = product;
		next();
	});
};

exports.read = (req, res) => {
	req.product.photo = undefined;
	req.product.gallery = undefined;
	return res.json(req.product);
};

exports.create = (req, res) => {
	let form = new formidable.IncomingForm({multiples:true});
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err){
			return res.status(400).json({
				error: 'Neuspelo učitavanje artikla'
			});
		}

		if(fields.tags){
			let tags = fields.tags.split(',');
			tags.map((tag) => {
				return tag.trim();
			});
			fields.tags = tags;
		}
		let product = new Product(fields);
		let img;
		

		if(files.gallery && files.gallery.length)
			//OVDE ULAZI AKO IMA VISE SLIKA
			for(let i=0;i<files.gallery.length;i++){
				if(files.gallery[i]){
					if(files.gallery[i] > 1_000_000){
						return res.status(400).json({
							error: 'Slika je prevelika'
						});
					}
					img = new Photo({
						"data": fs.readFileSync(files.gallery[i].path),
						"contentType": files.gallery[i].type
					});
					product.gallery[i] = img._id;
					// console.log(files.gallery[0].type);
					img.save((err, result) => {
						if(err){
							return res.status(400).json({
								error: errorHandler(error)
							});
						}
					});
					// console.log(img);

				}
			}
		//OVDE AKO IMA SAMO JEDNA SLIKA
		else{
			if(files.gallery){
				if(files.gallery > 1_000_000){
					return res.status(400).json({
						error: 'Slika je prevelika'
					});
				}
				img = new Photo({
					"data": fs.readFileSync(files.gallery.path),
					"contentType": files.gallery.type
				});
				product.gallery = img._id;
				img.save((err, result) => {
					if(err){
						return res.status(400).json({
							error: errorHandler(error)
						});
					}
				});
			}
		}
		// console.log(files);
		
		//ZA PROFILNU SLIKU
		if(files.photo){
			if(files.photo.size > 1_000_000){
				return res.status(400).json({
					error: "Prevelika profilna slika"
				});
			}
			// let n = product.photo.length();
			// console.log(n);
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}
		// console.log(fields);
		const {name, description, price, subcategory} = fields;
		product.priceWithDiscount = product.price - product.price * product.discount / 100;

		if(!name || !description || !price || !subcategory){
			return res.status(400).json({
				error: 'Neko od obaveznih polja je prazno'
			});
		}

		product.save((error, result) => {
			if(error){
				return res.status(400).json({
					error: errorHandler(error)
				});
			}
			res.json(result);
		});
	});
};

exports.remove = async(req, res) => {
	let product = req.product;
	product.remove((err, deletedProduct) => {
		if(error){
			return res.status(400).json({
				error: errorHandler(error)
			});
		}
		res.json({
			deletedProduct,
			'message': 'Proizvod uspesno izbrisan'
		});
	});
};

exports.update = (req, res) => {
	let form = new formidable.IncomingForm({multiples:true});
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if(err){
			return res.status(400).json({
				error: 'Neuspelo učitavanje artikla'
			});
		}
		
		let product = new Product(fields);
		let img;

		if(files.gallery.length)
			//OVDE ULAZI AKO IMA VISE SLIKA
			for(let i=0;i<files.gallery.length;i++){
				if(files.gallery[i]){
					if(files.gallery[i] > 1_000_000){
						return res.status(400).json({
							error: 'Slika je prevelika'
						});
					}
					img = new Photo({
						"data": fs.readFileSync(files.gallery[i].path),
						"contentType": files.gallery[i].type
					});
					product.gallery[i] = img._id;
					// console.log(files.gallery[0].type);
					img.save((err, result) => {
						if(err){
							return res.status(400).json({
								error: errorHandler(error)
							});
						}
					});
					// console.log(img);

				}
			}
		//OVDE AKO IMA SAMO JEDNA SLIKA
		else{
			if(files.gallery){
				if(files.gallery > 1_000_000){
					return res.status(400).json({
						error: 'Slika je prevelika'
					});
				}
				img = new Photo({
					"data": fs.readFileSync(files.gallery[i].path),
					"contentType": files.gallery.type
				});
				product.gallery[i] = img._id;
				img.save((err, result) => {
					if(err){
						return res.status(400).json({
							error: errorHandler(error)
						});
					}
				});
			}
		}

		//ZA PROFILNU SLIKU
		if(files.photo){
			if(files.photo.size > 1_000_000){
				return res.status(400).json({
					error: "Prevelika profilna slika"
				});
			}
			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}

		const {name, description, price, subcategory} = fields;

		if(!name || !description || !price || !subcategory){
			return res.status(400).json({
				error: 'Neko od obaveznih polja je prazno'
			});
		}
		
		

		product.save((err, result) => {
			if(err){
				return res.status(400).json({
					error: errorHandler(error)
				});
			}
			res.json(result);
		});
	});
};

exports.listProducts = async (req, res) => {
	let order = req.query.order ? req.query.order : 'asc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	await Product
		.find({hide: false})
		.select('-photo')
		.select('-gallery')
		.populate('subcategory')
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if(err){
				return res.status(400).json({
					error: 'Proizvodi nisu pronadjeni'
				})
			}
			res.json(products);
		});
};

exports.listRelated = async(req, res) => {
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;
	await Product
		.find({_id: { $ne:req.product }, subcategory: req.product.subcategory })
		.populate('subcategory', '_id name')
		.exec((err, products) => {
			if(err){
				return res.status(400).json({
					error: 'Nisu nadjeni povezani prozivodi'
				});
			}
			res.json(products);
		});
};

exports.listCategories = async(req, res) => {
	await Product.distinct('subcategory', {}, (err, categories) => {
		if(err){
				return res.status(400).json({
					error: 'Nisu nadjene kategorije povezane sa proizvodima'
				});
			}
			res.json(categories);
	});
};

exports.listBySearch = async(req, res) => {
	let order = req.body.order ? req.body.order : 'desc';
	let sortBy = req.body.sortBy ? req.body.sortBy : 'priceWithDiscount';
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let category = req.body.categoryId;
	let findArgs = {};
	
	// console.log(sortBy);
	
	for(let key in req.body.filters){
		if(req.body.filters[key].length > 0){
			if(key === 'priceWithDiscount'){
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1]
				};
			}
			else{
				findArgs[key] = req.body.filters[key];
			}
		}
	}
	let subcategory;
	if(!findArgs['subcategory']){
		subcategory = await Subcategory.find({
			category
		});
		if(subcategory.length === 0){
			subcategory = [await Subcategory.findById(
				category
			)];
		}

		findArgs['subcategory'] = [];
		for(let i = 0;i < subcategory.length;i++){
			findArgs['subcategory'].push(subcategory[i]._id);
		}

	}
	findArgs['hide'] = false;
	// console.log(findArgs);

	await Product.find(findArgs)
		.select('-photo')
		.select('-gallery')
		.populate('subcategory')
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.lean()
		.exec((err, data) => {
			if(err){
				return res.status(400).json({
					error: 'Nisu nadjeni prozivodi'
				});
			}
			// console.log(data);
			res.json({
				size: data.length,
				data
			});
		});
};

exports.photo = (req, res, next) => {
	// console.log(req.product.photo.data);
	if(req.product.photo.data){
		res.set('Content-Type', req.product.photo.contentType);
		return res.send(req.product.photo.data);
	}
	next();
};
//photo from gallery TODO

exports.gallery = (req, res, next) => {
	if(req.product.gallery){
		let gallery = [];
		for(let i=0;i<req.product.gallery.length;i++){
			gallery[i] = {
				"_id": req.product.gallery[i]._id,
				"contentType": req.product.gallery[i].contentType
			};
		}
		return res.send(gallery);
	}
	next();
};

exports.listSearchResults = (req, res) => {
	// console.log(req.body.param);
	Product
	.find({ 
		"$or":[{
			"name" : { 
				$regex: `${req.body.param}`, $options: 'i' 
			}},
			{
			"code" : { 
				$regex: `${req.body.param}`, $options: 'i' 
			}}
		],
		"hide": false
	})
	.exec((err, data) => {
		if (err) 
				return res.status(400).json({
					"error": err
				});
			else{
				console.log(data.length);
				res.json(data);
			}
		});
	
};

exports.listBySearchResults = async(req, res) => {
	let order = req.body.order ? req.body.order : 'desc';
	let sortBy = req.body.sortBy ? req.body.sortBy : 'name';
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let param = req.body.param;
	let findArgs = {};
		
	for(let key in req.body.filters){
		if(req.body.filters[key].length > 0){
			if(key === 'price'){
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1]
				};
			}
			else{
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	let subcategories = await Subcategory.find({
		'category': findArgs['category']
	});
	
	if(subcategories.length){
		findArgs['subcategory'] = [];
		for(let i = 0;i < subcategories.length;i++){
			findArgs['subcategory'].push(subcategories[i]._id);
		}
	}
	delete findArgs.category;
	findArgs['name'] = { 
		$regex: `${param}`, $options: 'i' 
	};
	findArgs['hide'] = false;

	// console.log(findArgs);

	await Product.find(findArgs)
		.select('-photo')
		.select('-gallery')
		.populate('subcategory')
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.lean()
		.exec((err, data) => {
			if(err){
				return res.status(400).json({
					error: 'Nisu nadjeni prozivodi'
				});
			}
			// console.log(data);
			res.json({
				size: data.length,
				data
			});
		});
};

exports.photoById = async(req, res, next, id) => {
	await Photo.findById(id)
	.exec((err, photo) => {
		if(err || !photo){
			return res.status(400).json({
				error: 'Neuspelo učitavanje slike iz galerije'
			});
		}
		req.photo = photo;
		next();
	});
};

exports.photoFromGallery = async(req, res) => {
	// console.log('ASD', req.photo.data);
	if(req.photo.data){
		res.set('Content-Type', req.photo.contentType);
		return res.send(req.photo.data);
	}
	next();
};

exports.listSelectedProducts = async (req, res) => {
	let order = req.query.order ? req.query.order : 'asc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : 20;

	await Product
		.find({hide: false, selected: true})
		.select('-photo')
		.select('-gallery')
		.populate('subcategory')
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if(err){
				return res.status(400).json({
					error: 'Proizvodi nisu pronadjeni'
				})
			}
			// console.log(products);
			res.json(products);
		});
};

exports.listDiscountProducts = async (req, res) => {
	let order = req.query.order ? req.query.order : 'asc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : 20;

	await Product
		.find({hide: false, discount: { "$ne": 0 } })
		.select('-photo')
		.select('-gallery')
		.populate('subcategory')
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if(err){
				return res.status(400).json({
					error: 'Proizvodi nisu pronadjeni'
				})
			}
			// console.log(products);
			res.json(products);
		});
};