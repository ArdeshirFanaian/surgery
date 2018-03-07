'use strict';

module.exports = function(app) {
	var restDoctorController = require('../controllers/restDoctorController');
	var restPatientController = require('../controllers/restPatientController');
	var restSurgeryController = require('../controllers/restSurgeryController');

	// Index Route
	app.route('/api/')
		.get(restDoctorController.index)

	// Doctor Routes
	app.route('/api/doctors')
		.get(restDoctorController.list_all_doctors)
		.post(restDoctorController.create_a_doctor);

	app.route('/api/doctors/:doctorId')
		.get(restDoctorController.read_a_doctor)
		.put(restDoctorController.update_a_doctor)
		.delete(restDoctorController.delete_a_doctor);

	// Patient Routes
	app.route('/api/patients')
		.get(restPatientController.list_all_patients)
		.post(restPatientController.create_a_patient);

	app.route('/api/patients/:patientId')
		.get(restPatientController.read_a_patient)
		.put(restPatientController.update_a_patient)
		.delete(restPatientController.delete_a_patient);

	// Surgery Routes
	app.route('/api/surgeries')
		.get(restSurgeryController.list_all_surgeries)
		.post(restSurgeryController.list_all_surgeries)
		.post(restSurgeryController.create_a_surgery);

	app.route('/api/surgeries/:surgeryId')
		.get(restSurgeryController.read_a_surgery)
		.put(restSurgeryController.update_a_surgery)
		.delete(restSurgeryController.delete_a_surgery);
};
