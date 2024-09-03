
const express = require('express');
const { signup, login, generateBackupToken, recoverPassword } = require('../controllers/authController');
const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);

// Backup Token Routes
router.post('/generate-backup-token', generateBackupToken);
router.post('/recover=password', recoverPassword);

module.exports = router;