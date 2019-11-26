const express = require('express');
const validator = require('validator');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')

const User = require('../models/user');

function validateRegisterForm(formData) {
    const errors = {};
    const name = decodeURIComponent(formData.name);
    const surname = decodeURIComponent(formData.surname);
    const phone = decodeURIComponent(formData.phone);
    const email = decodeURIComponent(formData.email);
    const password = decodeURIComponent(formData.password);
    
    let isFormValid = true;
	  let message = '';

  	if (typeof name !== 'string' || validator.isEmpty(name) || !validator.isAlpha(name)) {
  		isFormValid = false;
  		errors.name = "Name is required."
	}
  	if (typeof surname !== 'string' || validator.isEmpty(surname) || !validator.isAlpha(surname)) {
  		isFormValid = false;
  		errors.surname = "Surname is required, and must contain only letters."
    }
    if (typeof phone !== 'string' || validator.isEmpty(phone) || !validator.isNumeric(phone)) {
        isFormValid = false;
        errors.phone = "Phone is required.";
    }
  	if (typeof email !== 'string' || validator.isEmpty(email) || !validator.isEmail(email))  {
  		isFormValid = false;
  		errors.email = "Please enter a proper e-mail address.";
  	}
  	if (typeof password !== 'string' || validator.isEmpty(password)) {
  		isFormValid = false;
  		errors.password = "Password is required.";
  	}

    if (password.length < 6) {
        isFormValid =false;
        errors.password = "The password must be at least 4 characters long."
    }
    if (name.length < 2) {
        isFormValid = false;
        errors.name = "The name must be at least 2 characters long."
    }
    if (surname.length < 2) {
        isFormValid = false;
        errors.surname = "The surname must be at least 4 characters long."
    }
  	if (!isFormValid) {
  		message = "Check the form for errors.";
  	}

  	return {
  			success: isFormValid,
  			message: message,
  			errors: errors
  	};
}

// Registration
router.post('/auth/reg', (request, response) => {
    var validationResult = validateRegisterForm(request.body);
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }

    else {
        const password = request.body.password
        bcrypt.hash(password, null, null, (err, hash) => {
            User.create({
                name: request.body.name,
                surname: request.body.surname,
                phone: request.body.phone,
                email: request.body.email,
                password: hash,
                appointments: {appointmentList: [], size: 0}
            }).then(user => {
                console.log('user',user)
                response.status(200).json({
                    success: true,
                    message: 'You successfully created an account! Please login.'
                })
            })
                .catch(error => {
                    let authenticationResult = {
                        success: false,
                        message: 'Check the form for errors.',
                        errors: {}
                	};

                    if (error.name === 'MongoError' && error.code === 11000 && error.message.indexOf('email_1') > 0) {
              			authenticationResult.errors.email = 'This e-mail address is already taken.';
              		}
                    response.status(409).json(authenticationResult)
                })
        })
    }
});

function validateLoginForm(formData) {
  	const errors = {};
  	let isFormValid = true;
  	let message = '';

  	if (!formData || typeof formData.email !== 'string' || formData.email.trim().length === 0) {
  		isFormValid = false;
  		errors.email = 'Please provide your email.';
  	}
  	if (!formData || typeof formData.password !== 'string' || formData.password.trim().length === 0) {
  		isFormValid = false;
  		errors.password = 'Please provide your password.';
  	}
  	if (!isFormValid) {
  		message = 'Check the form for errors.';
  	}

  	return {
  		success: isFormValid,
  		message,
  		errors
  	}
}

router.post('/auth/login', (request, response) => {
    var validationResult = validateLoginForm(request.body);

    if (!validationResult.success) {
		response.status(400).json({
			success: false,
			message: validationResult.message,
			errors: validationResult.errors
		});
	}else{
        const errors = {};
        User.findOne({email:request.body.email})
            .then((user) => {
                if (!user) {
                    errors.login="Couldn't find email/password."
                    response.status(400).json({
					    success: false,
					    errors: errors
				    });
                }else{
                    bcrypt.compare(request.body.password, user.password, (err,result) =>{
                        if (!result) {
                            errors.login="Couldn't find email/password."
                            response.status(400).json({
                                success: false,
                                errors: errors
                            });
                        }
                        else {
                            const payload = {
                                sub: user._id
                            };
                            const userData = {
                                name: user.name,
                                surname: user.surname,
                                phone: user.phone,
                                email: user.email,
                                appointments: user.appointments
                            }
                            const token = jwt.sign(payload,"shhhhhhh");
                            response.json({
                                success: true,
                                message: 'You have successfully logged in!',
                                userData,
                                token
                            });
                        }
                    })
                }
            })
    }
});

router.get('/auth/logout', (request, response) => {
    if (request.session) {
        // delete session object
        request.session.destroy(() => {
        })
    }
});

function validateChangeForm(formData) {
    console.log("validation!!!!!!!!!");
    const errors = {};
    const name = decodeURIComponent(formData.name);
    const surname = decodeURIComponent(formData.surname);
    const phone = decodeURIComponent(formData.phone);
    const email = decodeURIComponent(formData.email);
    let isFormValid = true;
    let message = '';

    if (!formData || typeof email !== 'string' || email.trim().length === 0) {
        isFormValid = false;
        errors.email = 'Please provide your email.';
    }
  	if (typeof name !== 'string' || validator.isEmpty(name) || !validator.isAlpha(name)) {
        isFormValid = false;
        errors.name = "Name is required."
    }
    if (typeof surname !== 'string' || validator.isEmpty(surname) || !validator.isAlpha(surname)) {
        isFormValid = false;
        errors.surname = "Surname is required, and must contain only letters."
    }
    if (typeof phone !== 'string' || validator.isEmpty(phone) || !validator.isNumeric(phone)) {
        isFormValid = false;
        errors.phone = "Phone is required.";
    }
    if (!isFormValid) {
        message = 'Check the form for errors.';
    }

    return {
        success: isFormValid,
        message,
        errors
    }
}

router.post('/change', (request, response) => {
    var validationResult = validateChangeForm(request.body);

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }else{
        var newValues = {$set: {name: request.body.name, surname: request.body.surname, phone: request.body.phone, email: request.body.email}};
        User.updateOne({email:request.body.oldEmail}, newValues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
        });
        User.findOne({email:request.body.email})
            .then((user) => {
                    const userData = {
                        name: user.name,
                        surname: user.surname,
                        phone: user.phone,
                        email: user.email,
                        appointments: user.appointments
                    }
                    console.log(user.appointments);
                    response.json({
                        success: true,
                        message: 'You have successfully change data!',
                        userData
                    });
                }
            )
    }
});


router.post('/addAppointment', (request, response) => {
    User.findOne({email:request.body.email})
        .then((user) => {
            console.log("find1");
            let appointment = {
                id: user.appointments.size,
                serviceName: request.body.service,
                date: request.body.date,
                time: request.body.time
            };
            var newValues = {$addToSet: {"appointments.appointmentList": appointment}, $inc: {"appointments.size": 1}};
            User.updateOne(user, newValues, function(err, res) {
                if (err) throw err;
                console.log("2 document updated");
            });
            User.findOne({email:request.body.email})
                .then((user) => setTimeout(function(){
                    console.log("find2");
                    const userData = {
                        name: user.name,
                        surname: user.surname,
                        phone: user.phone,
                        email: user.email,
                        appointments: user.appointments
                    }
                    response.json({
                        success: true,
                        message: 'You have successfully add appointment!',
                        userData
                    });
            }, 5000));
        });
});


router.post('/deleteAppointment', (request, response) => {
    var newValues = {$pull: {"appointments.appointmentList": {id: request.body.id}}};
    User.updateOne({email:request.body.email}, newValues, function(err, res) {
        if (err) throw err;
        console.log("2 document updated");
    });

    User.findOne({email:request.body.email})
        .then((user) => {
            console.log("find2");
            const userData = {
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                email: user.email,
                appointments: user.appointments
            }
            response.json({
                success: true,
                message: 'You have successfully delete appointment!',
                userData
            });
    });
});  


module.exports = router;




        
        //     //newValues = {$inc: {"appointments.size": 1}};
        //     // User.updateOne(user, newValues, function(err, res) {
        //     //     if (err) throw err;
        //     //     console.log("2 document updated");
        //     // });

     
        // });
    //if(isFind){
        //var idNew =`${appointmentListLength + 1}`;
    
        //console.log(`Var ${appointmentListLength}`);
        //console.log(`Let ${appointmentListLengthlet}` )
        //console.log("idVar "+idNew);
        //console.log(`idLet ${appointmentListLengthlet +1}` )