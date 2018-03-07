'use strict';

var mongoose = require('mongoose'),
  Surgery = mongoose.model('Surgery'),
  Doctor = mongoose.model('Doctor'),
  Patient = mongoose.model('Patient');

const async = require('async');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.list_all_surgeries = async (req, res, next) => {
  try {
    const surgeries = await Surgery.find(req.body).populate('doctor').populate('patient');
    res.json(surgeries);
  } catch (e) {
    return next(e)
  }

};


exports.create_a_surgery = [
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
          res.json({ errors: errors.array() });
      } else if ( surgery.status === 'Inactive') {
        surgery.save((e) => {
          try {
            res.json(surgery);
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
          res.json({ overlapSurgeries: overlapSurgeries, doctorsWithOverlapSurgeries: selectedDoctor });
        } else {
          surgery.save((e) => {
            try {
              res.json(surgery);
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

exports.read_a_surgery = async (req, res, next) => {
  try {
    const surgery = await Surgery.findById(req.params.surgeryId).populate('doctor').populate('patient');
    res.json(surgery);
  } catch (error) {
    return next(e)
  }
};



exports.update_a_surgery = [
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
          res.json({ errors: errors.array() });
      } else if ( surgery.status === 'Inactive') {
        surgery.save((e) => {
          try {
            res.json(surgery);
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
          res.json({ overlapSurgeries: overlapSurgeries, doctorsWithOverlapSurgeries: selectedDoctor });
        } else {
          surgery.findOneAndUpdate(req.params.surgeryId, req.body, (e, surgery) => {
            try {
              res.json(surgery);
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

exports.delete_a_surgery = async (req, res, next) => {
  try {
    Surgery.findByIdAndRemove(req.params.surgeryId, () => {
      res.json({ message: 'Surgery successfully deleted' });
    });
  } catch (e) {
    return next(e)
  }
};
