var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DoctorSchema = new Schema(
  {
    first_name: {type: String, required: true},
    family_name: {type: String, required: true},
    email: {type: String, required: true},
    phone_number: {type: Number, required: true}
  }
);

// Virtual for doctor's full name
DoctorSchema
.virtual('name')
.get(function () {
  return this.first_name + ' ' + this.family_name;
});

// Virtual for doctor's URL
DoctorSchema
.virtual('url')
.get(function () {
  return '/schedule/doctor/' + this._id;
});

//Export model
module.exports = mongoose.model('Doctor', DoctorSchema);
