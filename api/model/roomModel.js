const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    gedung: {
        type: String,
        required: true
    },
    lantai: {
        type: Number,
        required: true
    },
    room_name: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: "/src/images/default.png"
    }
})

module.exports = mongoose.model('Room', roomSchema)