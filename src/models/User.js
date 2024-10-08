   const mongoose = require('mongoose');
   const UserSchema = new mongoose.Schema({
       name: {
          type: String,
          required: true,
       },
       matricule: {
          type: String,
          required: true,
          unique: true,
       },
       email: {
           type: String,
           required: true,
       },
       password: {
           type: String,
           required: true,
       },
       backupCode: {
           type: String,
       },
       createdAt: {
           type: Date,
           default: Date.now,
       },
   });
   module.exports = mongoose.model('User', UserSchema);
