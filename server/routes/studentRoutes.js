const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.post('/profile', studentController.createProfile);
router.patch('/profile/:id', studentController.updateProfile);
router.get('/:id', studentController.getProfile);

module.exports = router;
