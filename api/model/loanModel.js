const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loanSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rooms_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }],
    date_create: {
        type: Date,
        default: Date.now
    },
    start_time: Date,
    end_time: Date,
    date_of_loan: {
        type: Number,
        default: 0
    }, //[0] sunday [6]saturday
    repeat: {
        type: Number,
        default: 0
    }, //[0] no repeat, [1] repeat each week
    is_academic: {
        type: Boolean,
        require: true,
        default: false
    },
    is_accepted: {
        type: Boolean,
        require: true,
        default: false
    },
    document: {
        type: String
    },
    description: String,
    status: {
        type: String,
        default: "pending"
    },
})

module.exports = mongoose.model('Loan', loanSchema)