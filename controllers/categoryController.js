const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.categoryById = async(req, res, next, id) => {
	await Category.findById(id).exec((err, category) => {
		if(err || !category){
			return res.status(400).json({
				error: 'Kategorija ne postoji'
			});
		}
		req.category = category;
		next();
	});
};

exports.subcategoryById = async(req, res, next, id) => {
	await Subcategory.findById(id).exec((err, subcategory) => {
		if(err || !subcategory){
			return res.status(400).json({
				error: 'Podkategorija ne postoji'
			});
		}
		req.subcategory = subcategory;
		next();
	});
};

exports.createCat = async(req, res) => {
	const category = await new Category(req.body);
	await category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({ data });
	});
};

exports.createSubcat = async(req, res) => {
	const subcategory = await new Subcategory(req.body);
	await subcategory.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: err._message
			});
		}
		res.json({ data });
	});
};

exports.readCat = (req, res) => {
	return res.json(req.category);
};

exports.readSubcat = (req, res) => {
	return res.json(req.subcategory);
};

exports.updateCat = async(req, res) => {
	const category = req.category;
	category.name = req.body.name;
	await category.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json(data);
	});
};

exports.deleteCat = async(req, res) => {
	const category = req.category;
	await category.remove((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			message: 'Kategorija obrisana'
		});
	});
};

exports.listCat = async(req, res) => {
	await Category.find().exec((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({ data });
	});
};

exports.updateSubcat = async(req, res) => {
	const subcategory = req.subcategory;
	subcategory.name = req.body.name;
	await subcategory.save((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json(data);
	});
};

exports.deleteSubcat = async(req, res) => {
	const subcategory = req.subcategory;
	await subcategory.remove((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({
			message: 'Podkategorija obrisana'
		});
	});
};

exports.listSubcat = async(req, res) => {
	await Subcategory.find().exec((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({ data });
	});
};

exports.listSubcatByCat = async(req, res) => {
	await Subcategory.find({
		category: req.category._id
	}).exec((err, data) => {
		if(err){
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({ data });
	});
};