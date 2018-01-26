var mongoose = require('mongoose');
var moment = require('moment'); //for date handling

var Schema = mongoose.Schema;

var SurgerySchema = new Schema(
  {
    doctor: [{type: Schema.ObjectId, ref: 'Doctor', required: true}],
    patient: {type: Schema.ObjectId, ref: 'Patient', required: true},
    date: {type: Date, required: true},
    start_time: {type: String, required: true},
    end_time: {type: String, required: true},
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
.virtual('date_formatted')
.get(function () {
  return moment(this.date).format('LL');
});

SurgerySchema
.virtual('date_time_formatted')
.get(function () {
  return this.date_formatted + ' ' + this.start_time + ' - ' + this.end_time;
});


//Export model
module.exports = mongoose.model('Surgery', SurgerySchema);
