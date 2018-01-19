const Doctor = require('../models/doctor');
const Surgery = require('../models/surgery');
const async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// GET schedule home page.
exports.index = (req, res) => {
    res.render('index', { title: 'We\'re here to help you', page_title: 'Surgery Schedule' })
};

// Display all doctors
exports.doctor_list = async (req, res, next) => {
  try {
    const list_doctors = await Doctor.find()
    .sort([
      ['first_name', 'ascending']
    ]);
    res.render('doctor_list', { title: 'Doctor/s List', doctor_list: list_doctors });
  } catch (e) {
    return next(e);
  }
};

// Display Doctor create form on GET
exports.doctor_create_get = (req, res, next) => {
    res.render('doctor_form', { title: 'Create Doctor' });
};

// Handle Doctor create form on POST
exports.doctor_create_post = [

    // Validate fields
    check('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    check('phone_number').isLength({ min: 10, max: 10 }).trim().withMessage('Phone Number should be 10 digits'),
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
        const doctor = new Doctor({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            email: req.body.email,
            phone_number: req.body.phone_number
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('doctor_form', { title: 'Create Doctor', doctor: doctor, errors: errors.array() });
        } else {
            // Data from form is valid.
            doctor.save((err) => {
              try {
                res.redirect(doctor.url);
              } catch (e) {
                return next(e);
              }
            });
        }
    }
];

// Display detail page for a specific Doctor
exports.doctor_detail = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
    if (doctor == null) { // No results.
      var err = new Error('Doctor not found');
      err.status = 404;
      return next(err);
    } else {
      res.render('doctor_detail', { title: 'Doctor Detail', doctor: doctor });
    }
  } catch (e) {
    return next(e);
  }

};

// Display Doctor delete form on GET
exports.doctor_delete_get = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
    const surgeries = await Surgery.find({ 'doctor': req.params.id })
        .populate('doctor')
        .populate('patient');
      res.render('doctor_delete', { title: 'Delete Doctor', doctor: doctor, surgeries: surgeries });
  } catch (e) {
    return next(e)
  }
};

// Handle Doctor delete on POST
exports.doctor_delete_post = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.body.id);
    const surgeries = await Surgery.find({ 'doctor': req.body.id });
    if (surgeries.length > 0) {
      // Doctor has surgery. Render in same way as for GET route.
      res.render('doctor_delete', { title: 'Delete Doctor', doctor: doctor, suregeries: surgeries });
    } else {
      // Doctor has no surgeries. Delete object and redirect to the list of doctors.
      Doctor.findByIdAndRemove(req.body.id, (err) => {
        try {
          res.redirect('/schedule/doctors')
        } catch (err) {
          return next(err)
        }
      })
    }
  } catch (e) {
    return next(e);
  }
};

// Display Doctor update form on GET
exports.doctor_update_get = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
    if (doctor == null) { // No results.
        var err = new Error('Doctor not found');
        err.status = 404;
        return next(err);
    } else {
      res.render('doctor_form', { title: 'Update Doctor', doctor: doctor });
    }
  } catch (e) {
    return next(e)
  }
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
    async (req, res, next) => {
      try {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Doctor object with escaped/trimmed data and current id.
        const doctor = new Doctor({
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          email: req.body.email,
          phone_number: req.body.phone_number,
          _id: req.params.id
        });

        if (!errors.isEmpty()) { // There are errors so render the form again, passing sanitized values and errors
          try {
            const doctor = await Doctor.findById(req.params.id)
            res.render('doctor_form', { title: 'Update Doctor', doctor: doctor });
          } catch (e) {
            return next(e)
          }
        } else {
          // Data from form is valid.
          Doctor.findByIdAndUpdate(req.params.id, doctor, {}, (e) => {
            try {
              res.redirect(doctor.url);
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
