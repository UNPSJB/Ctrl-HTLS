const express = require('express');
const authController = require('../../controllers/auth/authController');

const router = express.Router();

router.post('/login', authController.loginController);
router.post('/logout', authController.logoutController);

module.exports = router;
