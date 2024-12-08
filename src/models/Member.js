const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    regitered: {
        lastName: String,
        firstName: String,
        birth : Date,
        town: String,
        phone: String,
        email: String,
        matricule: String,
    }
});
module.exports = mongoose.model('Member', MemberSchema, 'members');