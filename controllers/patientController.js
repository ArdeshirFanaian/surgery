var Patient = require('../models/patient');
var Surgery = require('../models/surgery');
var async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display all patients
exports.patient_list = function(req, res, next) {

    Patient.find()
        .sort([
            ['first_name', 'ascending']
        ])
        .exec(function(err, list_patients) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('patient_list', { title: 'Patient List', patient_list: list_patients });
        })

};

// Display Patient create form on GET
exports.patient_create_get = function(req, res, next) {
    res.render('patient_form', { title: 'Create Patient' });
};


// Handle Patient create on POST
exports.patient_create_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    check('email').isLength({ min: 1 }).isEmail().withMessage('must be an email').trim().normalizeEmail(),

    // Sanitize fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email'),
    sanitizeBody('phone_number'),
    sanitizeBody('insurance_id'),


    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create an Patient object with escaped and trimmed data.
        var patient = new Patient({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            insurance_id: req.body.insurance_id
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('patient_form', { title: 'Create Patient', patient: patient, errors: errors.array() });
            return;
        } else {
            // Data from form is valid.
            patient.save(function(err) {
                if (err) { return next(err); }
                // Successful - redirect to new patient record.
                res.redirect(patient.url);
            });
        }
    }
];

// Display detail page for a specific Patient

exports.patient_detail = function(req, res, next) {

    async.parallel({
        patient: function(callback) {
            Patient.findById(req.params.id)
                .exec(callback)
        },
        // patients_patients: function(callback) {
        //   Book.find({ 'patient': req.params.id },'title summary')
        //   .exec(callback)
        // },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.patient == null) { // No results.
            var err = new Error('Patient not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('patient_detail', { title: 'Patient Detail', patient: results.patient });
    });

};

// Display Patient delete form on GET
exports.patient_delete_get = function(req, res, next) {

    async.parallel({
      patient: function(callback) {
        Patient.findById(req.params.id).exec(callback);
      },
      surgeries: function(callback) {
        Surgery.find({ 'patient': req.params.id })
        .populate('doctor')
        .exec(callback)
      },

    }, function(err, results) {
        if (err) { return next(err); }

        // Successful, so render.
        res.render('patient_delete', { title: 'Delete Patient', patient: results.patient, surgeries: results.surgeries } );
    });

};

// Handle Patient delete on POST
exports.patient_delete_post = function(req, res, next) {

    async.parallel({
        patient: function(callback) {
          Patient.findById(req.body.id).exec(callback)
        },
        surgeries: function(callback) {
          Surgery.find({ 'patient': req.body.id }).exec(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.surgeries.length > 0) {
            // Patient has surgery. Render in same way as for GET route.
            res.render('patient_delete', { title: 'Delete Patient', patient: results.patient, suregeries: results.surgeries } );
            return;
        }
        else {
            // Patient has no surgeries. Delete object and redirect to the list of patients.
            Patient.findByIdAndRemove(req.body.id, function deletePatient(err) {
                if (err) { return next(err); }
                // Success - go to patient list
                res.redirect('/schedule/patients')
            })

        }
    });

};

// Display Doctor update form on GET
exports.patient_update_get = function(req, res, next) {

    // Get patients and patient for form.
    async.parallel({
        patient: function(callback) {
            Patient.findById(req.params.id).exec(callback)
        },

    }, function(err, results) {
          if (err) { return next(err); }
          if (results.patient==null) { // No results.
              var err = new Error('Patient not found');
              err.status = 404;
              return next(err);
          }
          // Success.
          res.render('patient_form', {title: 'Update Patient', patient:results.patient});
      });

};

// Handle Patient update on POST
exports.patient_update_post = [

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
    sanitizeBody('insurance_id'),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Patient object with escaped/trimmed data and current id.
        var patient = new Patient({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            insurance_id: req.body.insurance_id,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors
            async.parallel({
              patient: function(callback) {
                  Patient.findById(req.params.id).exec(callback)
              },
            }, function(err, results) {
                if (err) { return next(err); }

                res.render('patient_form', { title: 'Update Patient', patient: results.patient});
            });
            return;
        }
        else {
            // Data from form is valid.
            Patient.findByIdAndUpdate(req.params.id, patient, {}, function (err,result) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(result.url);
                });
        }
    }
];
