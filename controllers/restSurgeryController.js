'use strict';

var mongoose = require('mongoose'),
  Surgery = mongoose.model('Surgery');

exports.list_all_surgeries = function(req, res) {
  Surgery.find({}, function(err, surgery) {
    if (err)
      res.send(err);
    res.json(surgery);
  });
};


exports.create_a_surgery = function(req, res) {
  var new_surgery = new Surgery(req.body);
  new_surgery.save(function(err, surgery) {
    if (err)
      res.send(err);
    res.json(surgery);
  });
};

exports.read_a_surgery = function(req, res) {
  Surgery.findById(req.params.surgeryId, function(err, surgery) {
    if (err)
      res.send(err);
    res.json(surgery);
  });
};

exports.update_a_surgery = function(req, res) {
  Surgery.findOneAndUpdate({_id:req.params.surgeryId}, req.body, {new: true}, function(err, surgery) {
    if (err)
      res.send(err);
    res.json(surgery);
  });
};

exports.delete_a_surgery = function(req, res) {

  Surgery.remove({
    _id: req.params.surgeryId
  }, function(err, surgery) {
    if (err)
      res.send(err);
    res.json({ message: 'Surgery successfully deleted' });
  });
};
