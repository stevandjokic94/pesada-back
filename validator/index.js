exports.userSignupValidator = (req, res, next) => {

	//0 ZA FIZICKO LICE, 2 ZA PRAVNO
	if(req.body.role === 0) {
		console.log(req.body.password, req.body.passwordConfirm);
		req.check('name', 'Ime je obavezno polje').notEmpty();
		req.check('email', 'Email mora biti izmedju 3 i 32 karaktera')
		 .matches(/.+\@.+\..+/)
		 .withMessage('Neispravno uneta email adresa')
		 .isLength({
		 		min: 4,
		 		max: 32
		 });
		req.check('password', 'Lozinka je obavezno polje')
		  .notEmpty();
		if(req.body.password !== req.body.passwordConfirm){
			return res.status(400).json({
				error: 'Lozinke se ne poklapaju'
			});
		}
		req.check('password')
		 	.isLength({ min:6 })
		 	.withMessage('Lozinka mora imati najmanje 6 karaktera')
		 	.matches(/\d/)
		 	.withMessage('Lozinka mora sadrzati cifru');
		req.check('surname', 'Prezime je obavezno polje').notEmpty();
		req.check('phone', 'Broj telefona je obavezno polje').notEmpty();
		req.check('phone')
			.isLength({min:8, max:15})
			.withMessage('Neispravno unet broj telefona');
		req.check('street', 'Ulica je obavezno polje').notEmpty();
		req.check('homeNumber', 'Broj ulice je obavezno polje').notEmpty();
		req.check('homeNumber')
			.matches(/\d+/)
			.withMessage('Broj ulice mora sadrzati broj');
		req.check('postalCode', 'Postanski broj je obavezno polje').notEmpty();
		req.check('postalCode')
			.matches(/\d+/)
			.withMessage('Neispravno unet postanski broj');
		req.check('city', 'Grad/Mesto je obavezno polje').notEmpty();
		
		const errors = req.validationErrors();
		if(errors){
			const firstError = errors.map(error => error.msg)[0];
			return res.status(400).json({ error: firstError });
		}
		next();
	
	}
	else{

		req.check('name', 'Ime je obavezno polje').notEmpty();
		req.check('email', 'Email mora biti izmedju 3 i 32 karaktera')
		 .matches(/.+\@.+\..+/)
		 .withMessage('Neispravno uneta email adresa')
		 .isLength({
		 		min: 4,
		 		max: 32
		 });
		req.check('password', 'Lozinka je obavezno polje')
		  .notEmpty();
		if(req.body.password !== req.body.passwordConfirm){
			return res.status(400).json({
				error: 'Lozinke se ne poklapaju'
			});
		}
		req.check('password')
		 	.isLength({ min:6 })
		 	.withMessage('Lozinka mora imati najmanje 6 karaktera')
		 	.matches(/\d/)
		 	.withMessage('Lozinka mora sadrzati cifru');
		req.check('company', 'Naziv firme je obavezno polje').notEmpty();
		req.check('phone', 'Broj telefona je obavezno polje').notEmpty();
		req.check('phone')
			.isLength({min:8, max:15})
			.withMessage('Neispravno unet broj telefona');
		req.check('pib', 'PIB firme je obavezno polje').notEmpty();
		// req.check('phone')
		// 	.isLength({min:8, max:15})
		// 	.withMessage('Neispravno unet broj telefona');
		req.check('street', 'Ulica je obavezno polje').notEmpty();
		req.check('homeNumber', 'Broj ulice je obavezno polje').notEmpty();
		req.check('homeNumber')
			.matches(/\d+/)
			.withMessage('Broj ulice mora sadrzati broj');
		req.check('postalCode', 'Postanski broj je obavezno polje').notEmpty();
		req.check('postalCode')
			.matches(/\d+/)
			.withMessage('Neispravno unet postanski broj');
		req.check('city', 'Grad/Mesto je obavezno polje').notEmpty();
		
		const errors = req.validationErrors();
		if(errors){
			const firstError = errors.map(error => error.msg)[0];
			return res.status(400).json({ error: firstError });
		}
		next();

	}

};