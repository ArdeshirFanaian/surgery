var Surgery = require('../models/surgery');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');
var async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display surgery create form on GET
exports.surgery_create_get = function(req, res, next) {

    // Get all doctors and patients, which we can use for adding to our surgery.
    async.parallel({
        doctors: function(callback) {
            Doctor.find(callback);
        },
        patients: function(callback) {
            Patient.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('surgery_form', { title: 'Create Surgery', doctors: results.doctors, patients: results.patients });
    });

};

// Handle surgery create on POST
exports.surgery_create_post = [
    // Convert the doctors to an array
    (req, res, next) => {
        if (!(req.body.doctor instanceof Array)) {
            if (typeof req.body.doctor === 'undefined')
                req.body.doctor = [];
            else
                req.body.doctor = new Array(req.body.doctor);
        }
        next();
    },

    // Validate fields
    check('doctor', 'Doctor must not be empty.').trim().isLength({ min: 1}),
    check('patient', 'Patient must not be empty.').isLength({ min: 1 }).trim(),
    check('start_date', 'Invalid start date').isISO8601(),
    check('end_date', 'Invalid end date').isISO8601(),

    // Sanitize fields
    sanitizeBody('doctor'),
    sanitizeBody('patient'),
    sanitizeBody('status').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {


        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create a Surgery object with escaped and trimmed data.
        var surgery = new Surgery({
            patient: req.body.patient,
            doctor: req.body.doctor,
            start_date: req.body.start_date,
            start_time: req.body.start_time,
            end_date: req.body.end_date,
            end_time: req.body.end_time,
            status: req.body.status
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all doctors and patients for form
            async.parallel({
                doctors: function(callback) {
                    Doctor.find(callback);
                },
                patients: function(callback) {
                    Patient.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('surgery_form', { title: 'Create Surgery', doctors: results.doctors, patients: results.patients, surgery: surgery, errors: errors.array() });
            });
            return;
        } else {
            // Data from form is valid. Save surgery.
            surgery.save(function(err) {
                if (err) { return next(err); }
                //successful - redirect to new surgery record.
                res.redirect(surgery.url);
            });
        }
    }
];


// Display Surgery delete form on GET
exports.surgery_delete_get = function(req, res, next) {

    Surgery.findById(req.params.id)
        .populate('doctor')
        .populate('patient')
        .exec(function(err, surgery) {
            if (err) { return next(err); }
            if (surgery == null) { // No results.
                res.redirect('/schedule/surgeries');
            }
            // Successful, so render.
            res.render('surgery_delete', { title: 'Delete Surgery', surgery: surgery });
        })

};

// Handle Surgery delete on POST
exports.surgery_delete_post = function(req, res, next) {

    // Assume valid Surgery id in field.
    Surgery.findByIdAndRemove(req.body.id, function deleteSurgery(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of Surgery items.
        res.redirect('/schedule/surgeries');
    });

};

// Display Surgery update form on GET
exports.surgery_update_get = function(req, res, next) {

    // Get doctors and patient for form.
    async.parallel({
        surgery: function(callback) {
            Surgery.findById(req.params.id)
                .populate('doctor')
                .populate('patient')
                .exec(callback)
        },
        doctors: function(callback) {
            Doctor.find(callback);
        },
        patients: function(callback) {
            Patient.find(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.surgery == null) { // No results.
            var err = new Error('Surgery not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('surgery_form', {
            title: 'Update Surgery',
            selected_doctor: results.surgery.doctor._id,
            selected_patient: results.surgery.patient._id,
            surgery: results.surgery,
            doctors: results.doctors,
            patients: results.patients
        });
    });

};

// Handle Surgery update on POST
exports.surgery_update_post = [

    // Validate fields
    check('doctor', 'Doctor must not be empty.').trim(),
    check('patient', 'Patient must not be empty.').isLength({ min: 1 }).trim(),
    check('start_time', 'Start time must not be empty.').isLength({ min: 1 }).trim(),
    check('end_time', 'End time must not be empty.').isLength({ min: 1 }).trim(),
    check('start_date', 'Invalid start date').isISO8601(),
    check('end_date', 'Invalid end date').isISO8601(),
    // Sanitize fields
    sanitizeBody('doctor'),
    sanitizeBody('patient'),
    sanitizeBody('status').trim().escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Surgery object with escaped/trimmed data and current id.
        var surgery = new Surgery({
            patient: req.body.patient,
            doctor: req.body.doctor,
            start_date: req.body.start_date,
            start_time: req.body.start_time,
            end_date: req.body.end_date,
            end_time: req.body.end_time,
            status: req.body.status,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors
            async.parallel({

                doctors: function(callback) {
                    Doctor.find(callback);
                },
                patients: function(callback) {
                    Patient.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('surgery_form', {
                    title: 'Update Surgery',
                    doctors: results.doctors,
                    patients: results.patients
                });
            });
            return;
        } else {
            // Data from form is valid.
            Surgery.findByIdAndUpdate(req.params.id, surgery, {}, function(err, result) {
                if (err) { return next(err); }
                // Successful - redirect to detail page.
                res.redirect(result.url);
            });
        }
    }
];

exports.surgery_detail = function(req, res, next) {

    async.parallel({
        surgery: function(callback) {
            Surgery.findById(req.params.id)
                .populate('doctor')
                .populate('patient')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.
        res.render('surgery_detail', { title: 'Surgery Detail', surgery: results.surgery });
    });
};

// Display all surgeries
exports.surgery_list = function(req, res, next) {

    async.parallel({
        surgery: function(callback) {
            Surgery.find()
                .populate('doctor')
                .populate('patient')
                .exec(callback)
        },
        doctors: function(callback) {
            Doctor.find(callback);
        },
        patients: function(callback) {
            Patient.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        // Successful, so render.
        async.parallel({
          surgeries: function(callback) {
            var findObj = {
              'doctor': req.query.doctor,
              'patient': req.query.patient,
              'start_date': req.query.start_date,
              'end_date': req.query.end_date,
              'status': req.query.status
            }
            for (i in findObj) {
                if (findObj[i]==='') {
                  delete findObj[i]
                }
            }
              Surgery.find(findObj)
              .populate('doctor')
              .populate('patient')
              .exec(callback)
          },
        }, function(err, result, findObj) {
          if (err) {
            return next(err)
          }
        res.render('surgery_list', {
            title: 'Surgery List',
            title1: 'Find Surgeries',
            list: results.surgery,
            found_surgery: result.surgeries,
            doctors: results.doctors,
            patients: results.patients,
        })

    });
    });
};
