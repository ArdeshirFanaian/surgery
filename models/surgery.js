var mongoose = require('mongoose');
var moment = require('moment'); //for date handling

var Schema = mongoose.Schema;

var SurgerySchema = new Schema(
  {
    doctor: {type: Schema.ObjectId, ref: 'Doctor', required: true},
    patient: {type: Schema.ObjectId, ref: 'Patient', required: true},
    start_date: {type: Date, required: true},
    start_hour: {type: Number, required: true},
    end_date: {type: Date},
    status: {type: String, enum: ['Inactive', 'Active'], default: 'Active'},
  }
);

// Virtual for surgery's URL
SurgerySchema
.virtual('url')
.get(function () {
  return '/schedule/surgery/' + this._id;
});

SurgerySchema
.virtual('start_date_yyyy_mm_dd')
.get(function () {
  return moment(this.start_date).format('YYYY-MM-DD');
});

SurgerySchema
.virtual('end_date_yyyy_mm_dd')
.get(function () {
  return moment(this.end_date).format('YYYY-MM-DD');
});


//Export model
module.exports = mongoose.model('Surgery', SurgerySchema);
