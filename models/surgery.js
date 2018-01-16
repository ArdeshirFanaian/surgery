var mongoose = require('mongoose');
var moment = require('moment'); //for date handling

var Schema = mongoose.Schema;

var SurgerySchema = new Schema(
  {
    doctor: [{type: Schema.ObjectId, ref: 'Doctor', required: true}],
    patient: {type: Schema.ObjectId, ref: 'Patient', required: true},
    start_date: {type: String, required: true},
    start_time: {type: String, required: true},
    end_date: {type: String, required: true},
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
.virtual('start_date_formatted')
.get(function () {
  return moment(this.start_date + ' ' + this.start_time).format('LLL');
});

SurgerySchema
.virtual('end_date_formatted')
.get(function () {
  return moment(this.end_date + ' ' + this.end_time).format('LLL');
});


//Export model
module.exports = mongoose.model('Surgery', SurgerySchema);
