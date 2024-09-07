
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Sign Up
exports.signup = async (req, res) => {
  const { name, matricule, email, password } = req.body;
  try {
      let userMatricule = await User.findOne({ matricule });
      let userEmail = await User.findOne( { email });
      if (userMatricule) {
          console.error(userMatricule);
          return res.status(400).json({ matricule: 'User already exists' });
      }
      if (userEmail) {
        console.error(userEmail);
        return res.status(400).json({ email: 'User already exists'});
      }

      user = new User({
          name,
          matricule,
          email,
          password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
          user: {
              id: user.id,
          },
      };

      jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '5d' },
          (err, token) => {
              if (err) throw err;
              res.json({ token });
          }
      );
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

// Login
exports.login = async (req, res) => {
  const { matricule, password } = req.body;
  try {
      let user = await User.findOne({ matricule });
      if (!user) {
          
          return res.status(400).json({ connexion: 'Invalid matricule or password' });
          
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ connexion: 'Invalid matricule or password' });
      }

      const payload = {
          user: {
              id: user.id,
          },
      };

      jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '5d' },
          (err, token) => {
              if (err) throw err;
              res.json({ token, matricule: user.matricule });
          }
      );
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

exports.generateBackupToken = async (req, res) => {
  const { matricule } = req.body;
  let user = await User.findOne({ matricule });

  try {
    // Generate a backup code for password recovery
    user.backupCode = (Math.random() + 1).toString(36).substring(2);
    await user.save();
    sendEmail(user.email, 'Your Backup Code', `Your backup code is: ${user.backupCode}`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate backup token' });
  }
};

// Password recovery using backup code
exports.recoverPassword = async (req, res) => {
  const { matricule, backupCode, newPassword } = req.body;
  try {
      let user = await User.findOne({ matricule });
      if (!user || user.backupCode !== backupCode) {
          return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      sendEmail(user.email, 'Password updated', `Password updated successfully`);

      res.json({ msg: 'Password updated successfully' });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};