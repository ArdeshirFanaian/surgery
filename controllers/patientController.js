const Patient = require('../models/patient');
const Surgery = require('../models/surgery');
const async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display all patients
exports.patient_list = async (req, res, next) => {
  try {
    const list_patients = await Patient.find()
    .sort([
      ['first_name', 'ascending']
    ])
    res.render('patient_list', { title: 'Patient/s List', patient_list: list_patients });
  } catch (e) {
    return next(e)
  }
};

// Display Patient create form on GET
exports.patient_create_get = (req, res, next) => {
    res.render('patient_form', { title: 'Create Patient' });
};

// Handle Patient create on POST
exports.patient_create_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
    check('first_name').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
    check('family_name').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    check('insurance_id').isLength({ min: 1}).trim().withMessage('Insurance ID must be specified'),
    check('insurance_id').matches(/\d/).trim().withMessage('Insurance ID must be a number'),
    check('insurance_id').isLength({ min: 8, max:8 }).trim().withMessage('Insurance ID should be 8 digits'),
    check('phone_number').isLength({ min: 1 }).trim().withMessage('Phone Number must be specified'),
    check('phone_number').matches(/\d/).trim().withMessage('Phone Number must be a number'),
    check('phone_number').isLength({ min: 10, max:10 }).trim().withMessage('Phone Number should be 10 digits'),
    check('email').isLength({ min: 1 }).withMessage('Email should not be empty').trim(),
    check('email').isEmail().withMessage('Invalid email address').trim().normalizeEmail(),
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
        const patient = new Patient({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            insurance_id: req.body.insurance_id
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('patient_form', { title: 'Create Patient', patient: patient, errors: errors.array() });
        } else {
            // Data from form is valid.
            patient.save((err) => {
              try {
                res.redirect(patient.url);
                // Successful - redirect to new patient record.
              } catch (e) {
                return next(err)
              }
            });
        }
    }
];

// Display detail page for a specific Patient

exports.patient_detail = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
    if (patient == null) { // No results.
      var err = new Error('Patient not found');
      err.status = 404;
      return next(err);
    } else {
      res.render('patient_detail', { title: 'Patient Detail', patient: patient });
    }
  } catch (e) {
    return next(e);
  }
};

// Display Patient delete form on GET
exports.patient_delete_get = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
    const surgeries = await Surgery.find({ 'patient': req.params.id })
        .populate('doctor')
        .populate('patient');
      res.render('patient_delete', { title: 'Delete Patient', patient: patient, surgeries: surgeries });
  } catch (e) {
    return next(e)
  }
};

// Handle Patient delete on POST
exports.patient_delete_post = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.body.id);
    const surgeries = await Surgery.find({ 'patient': req.body.id });
    if (surgeries.length > 0) {
      // Patient has surgery. Render in same way as for GET route.
      res.render('patient_delete', { title: 'Delete Patient', patient: patient, suregeries: surgeries });
    } else {
      // Patient has no surgeries. Delete object and redirect to the list of patients.
      Patient.findByIdAndRemove(req.body.id, (err) => {
        try {
          res.redirect('/schedule/patients')
        } catch (err) {
          return next(err)
        }
      })
    }
  } catch (e) {
    return next(e);
  }
};

// Display Patient update form on GET
exports.patient_update_get = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
    if (patient == null) { // No results.
        var err = new Error('Patient not found');
        err.status = 404;
        return next(err);
    } else {
      res.render('patient_form', { title: 'Update Patient', patient: patient });
    }
  } catch (e) {
    return next(e)
  }
};

// Handle Patient update on POST
exports.patient_update_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
    check('first_name').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
    check('family_name').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    check('insurance_id').isLength({ min: 1}).trim().withMessage('Insurance ID must be specified'),
    check('insurance_id').matches(/\d/).trim().withMessage('Insurance ID must be a number'),
    check('insurance_id').isLength({ min: 8, max:8 }).trim().withMessage('Insurance ID should be 8 digits'),
    check('phone_number').isLength({ min: 1 }).trim().withMessage('Phone Number must be specified'),
    check('phone_number').matches(/\d/).trim().withMessage('Phone Number must be a number'),
    check('phone_number').isLength({ min: 10, max:10 }).trim().withMessage('Phone Number should be 10 digits'),
    check('email').isLength({ min: 1 }).withMessage('Email should not be empty').trim(),
    check('email').isEmail().withMessage('Invalid email address').trim().normalizeEmail(),
    
    // Sanitize fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('email'),
    sanitizeBody('phone_number').trim(),
    sanitizeBody('insurance_id'),

    // Process request after validation and sanitization
    async (req, res, next) => {
      try {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Doctor object with escaped/trimmed data and current id.
        const patient = new Patient({
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          email: req.body.email,
          phone_number: req.body.phone_number,
          insurance_id: req.body.insurance_id,
          _id: req.params.id
        });

        if (!errors.isEmpty()) { // There are errors so render the form again, passing sanitized values and errors
          try {
            const patient = await Patient.findById(req.params.id)
            res.render('patient_form', { title: 'Update Patient', patient: patient });
          } catch (e) {
            return next(e)
          }
        } else {
          // Data from form is valid.
          Patient.findByIdAndUpdate(req.params.id, patient, {}, (e) => {
            try {
              res.redirect(patient.url);
              // Successful - redirect to detail page.
            } catch (e) {
              return next(e)
            }
          });
        }
      } catch (e) {
        return next(e)
      }
    }
];
