const Surgery = require('../models/surgery');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display all surgeries
exports.surgery_list = async (req, res, next) => {
  try {
    const surgery = await Surgery.find().populate('doctor')
    .populate('patient')
    const doctors = await Doctor.find()
    const patients = await Patient.find()
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
    if (findObj.doctor!=undefined) {
      const surgeries = await Surgery.find(findObj).populate('doctor')
      .populate('patient');
      res.render('surgery_list', {
        title: 'Surgery List',
        title1: 'Find Surgeries',
        title2: 'Search Results',
        list: surgery,
        found_surgery: surgeries,
        doctors: doctors,
        patients: patients,
      })
    } else {
      res.render('surgery_list', {
        title: 'Surgery List',
        title1: 'Find Surgeries',
        title2: 'Search Results',
        list: surgery,
        doctors: doctors,
        patients: patients,
      })
    }
  } catch (e) {
    return next(e)
  }
};

// Display surgery details
exports.surgery_detail = async (req, res, next) => {
  try {
    const surgery = await Surgery.findById(req.params.id).populate('doctor').populate('patient')
      res.render('surgery_detail', { title: 'Surgery Detail', surgery: surgery });
  } catch (e) {
    return next(e);
  }
};

// Display surgery create form on GET
exports.surgery_create_get = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
    const patients = await Patient.find()
    res.render('surgery_form', { title: 'Create Surgery', doctors: doctors, patients: patients });
  } catch (e) {
    return next(err)
  }
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
    async (req, res, next) => {
      try {
        // Extract the validation errors from a request
        const errors = validationResult(req);


        // Create a Surgery object with escaped and trimmed data.
        const surgery = new Surgery({
          patient: req.body.patient,
          doctor: req.body.doctor,
          start_date: req.body.start_date,
          start_time: req.body.start_time,
          end_date: req.body.end_date,
          end_time: req.body.end_time,
          status: req.body.status
        });

        if (!errors.isEmpty()) {
          async (req, res, next) => {
            try {
              const doctors = await Doctor.find()
              const patients = await Patient.find()
              res.render('surgery_form', { title: 'Create Surgery', doctors: doctors, patients: patients, surgery: surgery, errors: errors.array() });
            } catch (e) {
              return next(e)
            }
          }
        } else {
          // Data from form is valid. Save surgery.
          surgery.save((e) => {
            try {
              res.redirect(surgery.url);
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


// Display Surgery delete form on GET
exports.surgery_delete_get = async (req, res, next) => {
  try {
    const surgery = await Surgery.findById(req.params.id)
        .populate('doctor')
        .populate('patient');
        if (surgery == null) { // No results.
            res.redirect('/schedule/surgeries');
        }
        res.render('surgery_delete', { title: 'Delete Surgery', surgery: surgery });
  } catch (e) {
    return next(e)
  }
};

// Handle Surgery delete on POST
exports.surgery_delete_post = async (req, res, next) => {
  try {
    // Assume valid Surgery id in field.
    Surgery.findByIdAndRemove(req.body.id, (e) => {
      // Success, so redirect to list of Surgery items.
      res.redirect('/schedule/surgeries');
    });

  } catch (e) {
    return next(err)
  }


};

// Display Surgery update form on GET
exports.surgery_update_get = async (req, res, next) => {
  try {
    const surgery = await Surgery.findById(req.params.id)
    .populate('doctor')
    .populate('patient')
    const doctors = await Doctor.find()
    const patients = await Patient.find()
    if (surgery == null) { // No results.
        var err = new Error('Surgery not found');
        err.status = 404;
        return next(err);
    } else {
      res.render('surgery_form', {
        title: 'Update Surgery',
        surgery: surgery,
        doctors: doctors,
        patients: patients
       });
    }
  } catch (e) {
    return next(e)
  }

};

// Handle Surgery update on POST
exports.surgery_update_post = [

    // Validate fields
    check('doctor', 'Doctor must not be empty.').isLength({ min: 1 }).trim(),
    check('patient', 'Patient must not be empty.').isLength({ min: 1 }).trim(),
    check('start_time', 'Start time must not be empty.').isLength({ min: 1 }).trim(),
    check('end_time', 'End time must not be empty.').isLength({ min: 1 }).trim(),
    check('start_date', 'Invalid start date').isISO8601().isLength({ min: 1 }),
    check('end_date', 'Invalid end date').isISO8601().isLength({ min: 1 }),
    // Sanitize fields
    sanitizeBody('doctor'),
    sanitizeBody('patient'),
    sanitizeBody('status').trim().escape(),

    // Process request after validation and sanitization
    async (req, res, next) => {
      try {
        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Update a Doctor object with escaped/trimmed data and current id.
        const surgery = new Surgery({
            patient: req.body.patient,
            doctor: req.body.doctor,
            start_date: req.body.start_date,
            start_time: req.body.start_time,
            end_date: req.body.end_date,
            end_time: req.body.end_time,
            status: req.body.status,
            _id: req.params.id
        });

        if (!errors.isEmpty()) { // There are errors so render the form again, passing sanitized values and errors
          try {
            const doctor = await Doctor.findById(req.params.id)
            const patients = await Patient.findById(req.params.id)
            res.render('surgery_form', {
                title: 'Update Surgery',
                doctors: doctors,
                patients: patients
            });
          } catch (e) {
            return next(e)
          }
        } else {
          // Data from form is valid.
          Surgery.findByIdAndUpdate(req.params.id, surgery, {}, (e) => {
            try {
              res.redirect(surgery.url);
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
