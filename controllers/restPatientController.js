'use strict';

var mongoose = require('mongoose'),
  Patient = mongoose.model('Patient');

exports.list_all_patients = function(req, res) {
  Patient.find({}, function(err, patient) {
    if (err)
      res.send(err);
    res.json(patient);
  });
};


exports.create_a_patient = function(req, res) {
  var new_patient = new Patient(req.body);
  new_patient.save(function(err, patient) {
    if (err)
      res.send(err);
    res.json(patient);
  });
};

exports.read_a_patient = function(req, res) {
  Patient.findById(req.params.patientId, function(err, patient) {
    if (err)
      res.send(err);
    res.json(patient);
  });
};

exports.update_a_patient = function(req, res) {
  Patient.findOneAndUpdate({_id:req.params.patientId}, req.body, {new: true}, function(err, patient) {
    if (err)
      res.send(err);
    res.json(patient);
  });
};

exports.delete_a_patient = function(req, res) {

  Patient.remove({
    _id: req.params.patientId
  }, function(err, patient) {
    if (err)
      res.send(err);
    res.json({ message: 'Patient successfully deleted' });
  });
};
