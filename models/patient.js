var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PatientSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    phone_number: {type: Number, required: true, minlength: 11, maxlength: 11},
    email: {type: String},
    insurance_id: {type: Number, minlength: 8, maxlength: 8, required: true},
  }
);

// Virtual for patient's full name
PatientSchema
.virtual('name')
.get(function () {
  return this.first_name + ' ' + this.family_name;
});

// Virtual for patient's URL
PatientSchema
.virtual('url')
.get(function () {
  return '/schedule/patient/' + this._id;
});

//Export model
module.exports = mongoose.model('Patient', PatientSchema);
