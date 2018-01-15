var express = require('express');
var router = express.Router();

// Require controller modules.
var doctor_controller = require('../controllers/doctorController');
var patient_controller = require('../controllers/patientController');
var surgery_controller = require('../controllers/surgeryController');

router.get('/', doctor_controller.index);

////////// Doctor Routes //////////

// GET request for creating a Doctor. NOTE This must come before routes that display Doctor (uses id).
router.get('/doctor/create', doctor_controller.doctor_create_get);

// POST request for creating Doctor.
router.post('/doctor/create', doctor_controller.doctor_create_post);

/* GET request for one Doctor. */
router.get('/doctor/:id', doctor_controller.doctor_detail);

// GET request for list of Doctors
router.get('/doctors', doctor_controller.doctor_list);

/* GET request to delete Doctor. */
router.get('/doctor/:id/delete', doctor_controller.doctor_delete_get);

// POST request to delete Doctor
router.post('/doctor/:id/delete', doctor_controller.doctor_delete_post);

/* GET request to update Doctor. */
router.get('/doctor/:id/update', doctor_controller.doctor_update_get);

// POST request to update Doctor
router.post('/doctor/:id/update', doctor_controller.doctor_update_post);

////////// Patient Routes //////////

// GET request for creating a Patient.
router.get('/patient/create', patient_controller.patient_create_get);

// POST request for creating Patient.
router.post('/patient/create', patient_controller.patient_create_post);

/* GET request for one Patient. */
router.get('/patient/:id', patient_controller.patient_detail);

// GET request for list of Doctors
router.get('/patients', patient_controller.patient_list);

/* GET request to delete Surgery. */
router.get('/patient/:id/delete', patient_controller.patient_delete_get);

// POST request to delete Surgery
router.post('/patient/:id/delete', patient_controller.patient_delete_post);

/* GET request to update Patient. */
router.get('/patient/:id/update', patient_controller.patient_update_get);

// POST request to update Patient
router.post('/patient/:id/update', patient_controller.patient_update_post);

////////// Surgery Routes //////////

// GET request for creating a Doctor. NOTE This must come before routes that display Doctor (uses id).
router.get('/surgery/create', surgery_controller.surgery_create_get);

// POST request for creating Doctor.
router.post('/surgery/create', surgery_controller.surgery_create_post);
//
/* GET request for one Doctor. */
router.get('/surgery/:id', surgery_controller.surgery_detail);

// GET request for list of Doctors
router.get('/surgeries', surgery_controller.surgery_list);

/* GET request to delete Surgery. */
router.get('/surgery/:id/delete', surgery_controller.surgery_delete_get);

// POST request to delete Surgery
router.post('/surgery/:id/delete', surgery_controller.surgery_delete_post);

/* GET request to update Surgery. */
router.get('/surgery/:id/update', surgery_controller.surgery_update_get);

// POST request to update Surgery
router.post('/surgery/:id/update', surgery_controller.surgery_update_post);


module.exports = router;
