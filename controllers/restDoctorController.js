'use strict';

var mongoose = require('mongoose'),
  Doctor = mongoose.model('Doctor');

exports.list_all_doctors = function(req, res) {
  Doctor.find({}, function(err, doctor) {
    if (err)
      res.send(err);
    res.json(doctor);
  });
};


exports.create_a_doctor = function(req, res) {
  var new_doctor = new Doctor(req.body);
  new_doctor.save(function(err, doctor) {
    if (err)
      res.send(err);
    res.json(doctor);
  });
};

exports.read_a_doctor = function(req, res) {
  Doctor.findById(req.params.doctorId, function(err, doctor) {
    if (err)
      res.send(err);
    res.json(doctor);
  });
};

exports.update_a_doctor = function(req, res) {
  Doctor.findOneAndUpdate({_id:req.params.doctorId}, req.body, {new: true}, function(err, doctor) {
    if (err)
      res.send(err);
    res.json(doctor);
  });
};

exports.delete_a_doctor = function(req, res) {

  Doctor.remove({
    _id: req.params.doctorId
  }, function(err, doctor) {
    if (err)
      res.send(err);
    res.json({ message: 'Doctor successfully deleted' });
  });
};
