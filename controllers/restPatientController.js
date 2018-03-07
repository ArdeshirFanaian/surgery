'use strict';

const mongoose = require('mongoose'),
  Patient = mongoose.model('Patient');
const async = require('async');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.list_all_patients = async (req, res, next) => {
  try {
    const patientsList = await Patient.find().sort([
      ['first_name', 'ascending']
    ]);
      res.json({patientsList})
  } catch (e) {
    return next(e)
  }
};


exports.create_a_patient = [

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

 (req, res, next) => {

   // Extract the validation errors from a request
   const errors = validationResult(req);

    const newPatient = new Patient(req.body);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.json({newPatient, errors: errors.array() });
    } else {
        // Data from form is valid.
        newPatient.save((e, patient) => {
          try {
            res.json(patient);
          } catch (e) {
            return next(e);
          }
        });
    }
  }
];

exports.read_a_patient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
    if (patient == null) { // No results.
      let err = new Error('Patient not found');
      err.status = 404;
      return next(err);
    } else {
      res.json({patient: patient });
    }
  } catch (e) {
    return next(e);
  }
};

exports.update_a_patient = [

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
  (req, res, next) => {

      // Extract the validation errors from a request
      const errors = validationResult(req);

      // Create an Patient object with escaped and trimmed data.
      const patient = new Patient({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        insurance_id: req.body.insurance_id,
        _id: req.params.id
      });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.json({patient: patient, errors: errors.array() });
      } else {
          // Data from form is valid.
          Patient.findOneAndUpdate({_id:req.params.patientId}, req.body, {new: true}, (err, patient) => {
            try {
              res.json(patient);
            } catch (e) {
              return next(e);
            }
          });
      }
  }
];

exports.delete_a_patient = async (req, res, next) => {
  try {
    Patient.findByIdAndRemove(req.params.patientId, () => {
      res.json({ message: 'Patient successfully deleted' });
    });
  } catch (e) {
    return next(e)
  }
};
