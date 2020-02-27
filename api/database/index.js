require('dotenv').config();
const mongoose = require('mongoose');
const DB = process.env.MONGODB_KEY

exports.connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(DB, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            })
            .then((res, err) => {
                if (err) return reject(err)
                resolve()
            })
            .catch(err => {
                return reject(err)
            })
    })
}
exports.disconnect = () => {
    mongoose.disconnect();
}