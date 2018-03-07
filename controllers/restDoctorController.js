'use strict';

const mongoose = require('mongoose'),
  Doctor = mongoose.model('Doctor'),
  Surgery = mongoose.model('Surgery');
const async = require('async');
const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

  // GET schedule home page.
exports.index = (req, res) => {
      res.json({ title: 'We\'re here to help you', page_title: 'Surgery Schedule' })
  };

// Display list of all doctors
exports.list_all_doctors = async (req, res, next) => {
  try {
    const list_doctors = await Doctor.find()
    .sort([
      ['first_name', 'ascending']
    ]);
    res.json({doctor_list: list_doctors })
  } catch (e) {
    return next(e);
  }
};

exports.create_a_doctor = [
  // Validate fields
  check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
  check('first_name').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
  check('family_name').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
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

  // Process request after validation and sanitization
  (req, res, next) => {

      // Extract the validation errors from a request
      const errors = validationResult(req);

      // Create an Doctor object with escaped and trimmed data.
      const new_doctor = new Doctor(req.body);

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.json({new_doctor: new_doctor, errors: errors.array() });
      } else {
          // Data from form is valid.
          new_doctor.save((e, doctor) => {
            try {
              res.json(doctor);
            } catch (e) {
              return next(e);
            }
          });
      }
  }
];

exports.read_a_doctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId)
    if (doctor == null) { // No results.
      let err = new Error('Doctor not found');
      err.status = 404;
      return next(err);
    } else {
      res.json({ title: 'Doctor Detail', doctor: doctor });
    }
  } catch (e) {
    return next(e);
  }
};

exports.update_a_doctor = [
  // Validate fields
  check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.'),
  check('first_name').isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  check('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.'),
  check('family_name').isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
  check('phone_number').isLength({ min: 1 }).trim().withMessage('Phone Number must be specified'),
  check('phone_number').matches(/\d/).trim().withMessage('Phone Number must be a number'),
  check('phone_number').isLength({ min: 10, max:10 }).trim().withMessage('Phone Number should be 10 digits'),
  check('email').isLength({ min: 1 }).withMessage('Email should not be empty').trim(),
  check('email').isEmail().withMessage('Invalid email address').trim().normalizeEmail(),
  // Sanitize fields
  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('email').trim().escape(),
  sanitizeBody('phone_number').trim(),

  // Process request after validation and sanitization
  (req, res, next) => {

      // Extract the validation errors from the request
      const errors = validationResult(req);

      // Create an Doctor object with escaped and trimmed data.
      const doctor = new Doctor({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        _id: req.params.id
      });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.json({ doctor:doctor, errors: errors.array() });
      } else {
          // Data from form is valid.
          Doctor.findOneAndUpdate({_id:req.params.doctorId}, req.body, (err, doctor) => {
            try {
              res.json(doctor);
            } catch (e) {
              return next(e)
            }
          });
      }
  }
];



exports.delete_a_doctor = async (req, res, next) => {
  try {
    const surgeries = await Surgery.find({ 'doctor': req.params.doctorId });
    if (surgeries.length > 0) {
      const doctor = await Doctor.findById(req.params.doctorId);
      res.json({doctor: doctor, surgeries: surgeries})
    } else {
      Doctor.findByIdAndRemove(req.params.doctorId, (err) => {
        try {
          res.json({ message: 'Doctor successfully deleted' });
        } catch (err) {
          return next(err)
        }
      });
    }
  } catch (e) {
    return next(e)
  }
};
