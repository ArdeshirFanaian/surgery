var Doctor = require('../models/doctor');
var Surgery = require('../models/surgery');
var async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// GET schedule home page.
exports.index = function(req, res) {

    res.render('index', { title: 'We\'re here to help you' })

};

// Display all doctors
exports.doctor_list = function(req, res, next) {

    Doctor.find()
        .sort([
            ['first_name', 'ascending']
        ])
        .exec(function(err, list_doctors) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('doctor_list', { title: 'Doctor/s List', doctor_list: list_doctors });
        })

};

// Display Doctor create form on GET
exports.doctor_create_get = function(req, res, next) {
    res.render('doctor_form', { title: 'Create Doctor' });
};

// Handle Doctor create on POST
exports.doctor_create_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('phone_number').isLength({ min: 10, max:10 }).trim().withMessage('Phone Number should be 10 digits'),
    check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    check('email').isEmail().isLength({ min: 1 }).withMessage('must be an email').trim().normalizeEmail(),

    // Sanitize fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email'),
    sanitizeBody('phone_number').trim(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create an Doctor object with escaped and trimmed data.
        var doctor = new Doctor({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('doctor_form', { title: 'Create Doctor', doctor: doctor, errors: errors.array() });
            return;
        } else {
            // Data from form is valid.
            doctor.save(function(err) {
                if (err) { return next(err); }
                // Successful - redirect to new doctor record.
                res.redirect(doctor.url);
            });
        }
    }
];

// Display detail page for a specific Doctor
exports.doctor_detail = function(req, res, next) {

    async.parallel({
        doctor: function(callback) {
            Doctor.findById(req.params.id)
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.doctor == null) { // No results.
            var err = new Error('Doctor not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('doctor_detail', { title: 'Doctor Detail', doctor: results.doctor });
    });

};

// Display Doctor delete form on GET
exports.doctor_delete_get = function(req, res, next) {

    async.parallel({
      doctor: function(callback) {
        Doctor.findById(req.params.id).exec(callback);
      },
      surgeries: function(callback) {
        Surgery.find({ 'doctor': req.params.id })
        .populate('patient')
        .exec(callback)
      },

    }, function(err, results) {
        if (err) { return next(err); }

        // Successful, so render.
        res.render('doctor_delete', { title: 'Delete Doctor', doctor: results.doctor, surgeries: results.surgeries } );
    });

};

// Handle Doctor delete on POST
exports.doctor_delete_post = function(req, res, next) {

    async.parallel({
        doctor: function(callback) {
          Doctor.findById(req.body.id).exec(callback)
        },
        surgeries: function(callback) {
          Surgery.find({ 'doctor': req.body.id }).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.surgeries.length > 0) {
            // Doctor has surgery. Render in same way as for GET route.
            res.render('doctor_delete', { title: 'Delete Doctor', doctor: results.doctor, suregeries: results.surgeries } );
            return;
        }
        else {
            // Doctor has no surgeries. Delete object and redirect to the list of doctors.
            Doctor.findByIdAndRemove(req.body.id, function deleteDoctor(err) {
                if (err) { return next(err); }
                // Success - go to doctor list
                res.redirect('/schedule/doctors')
            })

        }
    });

};

// Display Doctor update form on GET
exports.doctor_update_get = function(req, res, next) {

    // Get doctors and patient for form.
    async.parallel({
        doctor: function(callback) {
            Doctor.findById(req.params.id).exec(callback)
        },

    }, function(err, results) {
          if (err) { return next(err); }
          if (results.doctor==null) { // No results.
              var err = new Error('Doctor not found');
              err.status = 404;
              return next(err);
          }
          // Success.
          res.render('doctor_form', {title: 'Update Doctor', doctor:results.doctor});
      });

};

// Handle Doctor update on POST
exports.doctor_update_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    check('email').isEmail().isLength({ min: 1 }).withMessage('must be an email').trim().normalizeEmail(),

    // Sanitize fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email'),
    sanitizeBody('phone_number').trim(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Doctor object with escaped/trimmed data and current id.
        var doctor = new Doctor({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors
            async.parallel({
              doctor: function(callback) {
                  Doctor.findById(req.params.id).exec(callback)
              },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('doctor_form', { title: 'Update Doctor', doctor: results.doctor});
            });
            return;
        }
        else {
            // Data from form is valid.
            Doctor.findByIdAndUpdate(req.params.id, doctor, {}, function (err,result) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(result.url);
                });
        }
    }
];
