const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    nim: {
        type: String,
        indexes: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: "/src/images/default.png"
    },
    prodi: {
        type: String,
        required: true
    },
    jurusan: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('User', userSchema);