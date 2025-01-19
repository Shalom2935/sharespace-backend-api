
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Members = require('../models/Member');
const sendEmail = require('../utils/sendEmail');

// Sign Up
exports.signup = async (req, res) => {
  const { name, matricule, password } = req.body;
  try {
      // Check if the matricule exists in the Members collection
      let members = await Members.findOne({ "registered.matricule": matricule });
      if (!members) {
          return res.status(400).json({ matriculeError: 'Wrong Matricule' });
      }

      const email = members.registered.email;
      if(!email) {
          return res.status(400).json({ matriculeError: 'No email associated with this matricule' });
      }

      let user = await User.findOne({ matricule });
      if (user) {
          return res.status(400).json({ matriculeError: 'User already exists' });
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
      let user = await Members.findOne({ matricule });
      let firstLogin = false;
      if (!user) {
          return res.status(400).json({ connexion: 'Wrong matricule or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      const unencryptedPassword = password;
      if (unencryptedPassword == user.password){
        firstLogin = true;
      }
      if (!isMatch & !firstLogin) {
          return res.status(400).json({ connexion: 'Wrong matricule or password' });
      }

      const payload = {
          user: {
              id: user._id,
          },
      };

      jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '5d' },
          (err, token) => {
              if (err) throw err;
              res.json({ token, matricule: matricule, message: {'firstLogin' : firstLogin} });
          }
      );
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

// UpdatePassword 
exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user._id;

    try{
        const user = await Members.findBy(userId);

        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully', status: 'OK'});
    } catch(err) {
        res.status(500).json({ message: 'server error', err})
    }
}
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