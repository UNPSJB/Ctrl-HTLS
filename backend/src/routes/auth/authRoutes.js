const express = require('express');
const authController = require('../../controllers/auth/authController');

const router = express.Router();

router.post('/login', authController.loginController);
router.post('/logout', authController.logoutController);
router.post('/cambiar-contrasena', authController.changePasswordController);

module.exports = router;
