const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
        lastName: String,
        firstName: String,
        birth : Date,
        town: String,
        phone: String,
        email: String,
        matricule: String,
        password: String
});
module.exports = mongoose.model('Member', MemberSchema, 'members');