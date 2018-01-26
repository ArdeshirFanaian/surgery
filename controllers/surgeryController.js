const Surgery = require('../models/surgery');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const async = require('async');


const {
  check,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody
} = require('express-validator/filter');

// Display all surgeries
exports.surgery_list = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort([
      ['first_name', 'ascending']
    ])
    const patients = await Patient.find().sort([
      ['first_name', 'ascending']
    ])
    const findObj = {
      'doctor': req.query.doctor,
      'patient': req.query.patient,
      'date': req.query.date,
      'status': req.query.status
    }
    for (i in findObj) {
      if (!findObj[i]) {
        delete findObj[i]
      }
    }
    const surgeries = await Surgery.find(findObj).populate('doctor')
      .populate('patient');
    res.render('surgery_list', {
      title: 'Surgery List',
      title1: 'Find Surgeries',
      title2: 'Search Results',
      list: surgeries,
      doctors: doctors,
      patients: patients,
    })
  } catch (e) {
    return next(e)
  }
};

// Display surgery details
exports.surgery_detail = async (req, res, next) => {
  try {
    const surgery = await Surgery.findById(req.params.id).populate('doctor').populate('patient')
    res.render('surgery_detail', {
      title: 'Surgery Detail',
      surgery: surgery
    });
  } catch (e) {
    return next(e);
  }
};

// Display surgery create form on GET
exports.surgery_create_get = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort([
      ['first_name', 'ascending']
    ])
    const patients = await Patient.find().sort([
      ['first_name', 'ascending']
    ])
    res.render('surgery_form', {
      title: 'Create Surgery',
      doctors: doctors,
      patients: patients
    });
  } catch (e) {
    return next(err)
  }
};

// Handle surgery create on POST
exports.surgery_create_post = [
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
  check('doctor', 'Doctor must not be empty.').isLength({ min: 1}).trim(),
  check('patient', 'Patient must not be empty.').isLength({ min: 1 }).trim(),
  check('start_time', 'Start time must not be empty.').isLength({ min: 1 }),
  check('end_time', 'End time must not be empty.').isLength({ min: 1 }),
  check('date', 'Invalid date').isISO8601(),

  // Sanitize fields
  sanitizeBody('doctor'),
  sanitizeBody('patient'),
  sanitizeBody('status').trim().escape(),

  async (req, res, next) => {
    try {
      // Extract the validation errors from a request
      const errors = validationResult(req);

      // Create a Surgery object with escaped and trimmed data.
      const surgery = new Surgery({
        patient: req.body.patient,
        doctor: req.body.doctor,
        date: req.body.date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        status: req.body.status
      });
      if (!errors.isEmpty()) {
          const doctors = await Doctor.find().sort([ ['first_name', 'ascending'] ])
          const patients = await Patient.find().sort([ ['first_name', 'ascending'] ])
          res.render('surgery_form', { title: 'Create Surgery', doctors: doctors, patients: patients, surgery: surgery, errors: errors.array() });
      } else if ( surgery.status === 'Inactive') {
        surgery.save((e) => {
          try {
            res.redirect(surgery.url);
          } catch (e) {
            return next(e)
          }
        });
      } else {
        const overlapSurgeries = await Surgery.find({
          $and: [
            { doctor: {$in: surgery.doctor} },
            { date: {$eq: surgery.date} },
            { status: 'Active' },
            { $or:[
              {
                start_time: {
                  $gte: surgery.start_time,
                  $lt: surgery.end_time
                }
              },
              {
                end_time: {
                  $gte: surgery.start_time,
                  $lt: surgery.end_time
                }
              },
              {
                start_time: {
                  $lt: surgery.start_time
                },
                end_time: {
                  $gte: surgery.end_time
                }
              }
            ]}
          ]
        }).populate('doctor').populate('patient');
        if (overlapSurgeries.length > 0) {
          let selectedDoctor = [];
          for (var i = 0; i < overlapSurgeries.length; i++) { // loop through all found surgeries in case there are more than one overlapSurgeries
            for (var j = 0; j < overlapSurgeries[i].doctor.length; j++) { // loop through all doctors in the surgery in case there are more than one doctor involved
              for (var k = 0; k < surgery.doctor.length; k++) {
                // loop through selected doctors and check which doctors from the selected doctors
                // are the same with the overlap surgeries in case there were several doctors in selected for the surgery
                // and some of them were the same in the overlap surgeries
                if (overlapSurgeries[i].doctor[j]._id.toString() === surgery.doctor[k].toString()) {
                  selectedDoctor.push(overlapSurgeries[i].doctor[j].name) ;
                }
              }
            }
          }
          const doctors = await Doctor.find().sort([ ['first_name', 'ascending'] ])
          const patients = await Patient.find().sort([ ['first_name', 'ascending'] ])
          res.render('surgery_form', { title: 'Create Surgery', doctors: doctors, patients: patients,
          surgery: surgery, overlapSurgeries: overlapSurgeries, selectedDoctor: selectedDoctor });
        } else {
          surgery.save((e) => {
            try {
              res.redirect(surgery.url);
            } catch (e) {
              return next(e)
            }
          });
        }
      }
    } catch (e) {
      return next(e)
    }
  },
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
    res.render('surgery_delete', {
      title: 'Delete Surgery',
      surgery: surgery
    });
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
    const doctors = await Doctor.find().sort([
      ['first_name', 'ascending']
    ])
    const patients = await Patient.find().sort([
      ['first_name', 'ascending']
    ])
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
  check('patient', 'Patient must not be empty.').isLength({ min: 1}).trim(),
  check('start_time', 'Start time must not be empty.').isLength({ min: 1 }).trim(),
  check('end_time', 'End time must not be empty.').isLength({ min: 1 }).trim(),
  check('date', 'Invalid start date').isISO8601().isLength({ min: 1 }),

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
        date: req.body.date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        status: req.body.status,
        _id: req.params.id
      });

      if (!errors.isEmpty()) { // There are errors so render the form again, passing sanitized values and errors
        try {
          const doctor = await Doctor.find().sort([
            ['first_name', 'ascending']
          ])
          const patients = await Patient.find().sort([
            ['first_name', 'ascending']
          ])
          res.render('surgery_form', {
            title: 'Update Surgery',
            doctors: doctors,
            patients: patients,
            errors: errors.array()
          });
        } catch (e) {
          return next(e)
        }
      } else if (surgery.status === 'Inactive') {
        Surgery.findByIdAndUpdate(req.params.id, surgery, {}, (e,thesurgery) => {
          try {
            res.redirect(thesurgery.url);
          } catch (e) {
            return next(e)
          }
        });
      } else {
        const overlapSurgeries = await Surgery.find({
          $and: [
            { doctor: {$in: surgery.doctor} },
            { date: {$eq: surgery.date} },
            { status: 'Active' },
            { $or:[
              {
                start_time: {
                  $gte: surgery.start_time,
                  $lt: surgery.end_time
                }
              },
              {
                end_time: {
                  $gte: surgery.start_time,
                  $lt: surgery.end_time
                }
              },
              {
                start_time: {
                  $lt: surgery.start_time
                },
                end_time: {
                  $gte: surgery.end_time
                }
              }
            ]}
          ]
        }).populate('doctor').populate('patient');

        if (overlapSurgeries.length > 0) {
          let selectedDoctor = [];
          for (var i = 0; i < overlapSurgeries.length; i++) { // loop through all found surgeries in case there are more than one overlapSurgeries
            for (var j = 0; j < overlapSurgeries[i].doctor.length; j++) { // loop through all doctors in the surgery in case there are more than one doctor involved
              for (var k = 0; k < surgery.doctor.length; k++) {
                // loop through selected doctors and check which doctors from the selected doctors
                // are the same with the overlap surgeries in case there were several doctors in selected for the surgery
                // and some of them were the same in the overlap surgeries
                if (overlapSurgeries[i].doctor[j]._id.toString() === surgery.doctor[k].toString()) {
                  selectedDoctor.push(overlapSurgeries[i].doctor[j].name) ;
                }
              }
            }
          }

          const doctors = await Doctor.find().sort([ ['first_name', 'ascending'] ])
          const patients = await Patient.find().sort([ ['first_name', 'ascending'] ])
          res.render('surgery_form', { title: 'Update Surgery', doctors: doctors, patients: patients,
          overlapSurgeries: overlapSurgeries, selectedDoctor: selectedDoctor});
        } else {
          Surgery.findByIdAndUpdate(req.params.id, surgery, {}, (e,thesurgery) => {
            try {
              res.redirect(thesurgery.url);
            } catch (e) {
              return next(e)
            }
          });
        }
      }
    } catch (e) {
      return next(e)
    }
  }
];
