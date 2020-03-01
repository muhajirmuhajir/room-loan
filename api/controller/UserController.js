require('dotenv').config()
const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const KEY = process.env.JWT_KEY
const validator = require('validator')

exports.user_register = async (req, res, next) => {
    const password = await bcrypt.hash(req.body.password, 11)

    const email = validator.isEmail(req.body.email)
    if (!email) {
        res.status(401).json({
            success: false,
            message: "email not valid"
        })
    } else {
        newUser = new User({
            nim: req.body.nim,
            password: password,
            name: req.body.name,
            prodi: req.body.prodi,
            jurusan: req.body.jurusan,
            faculty: req.body.faculty,
            email: req.body.email
        })

        User.create(newUser)
            .then(result => {
                res.status(200).json({
                    success: true,
                    message: "user registered"
                })
            })
            .catch(err => {
                res.status(401).send(err)
            })
    }
}

exports.user_login = (req, res, next) => {
    const nim = req.body.nim
    const password = req.body.password

    User.findOne({
            nim: nim
        }).exec()
        .then(async user => {
            if (!user) throw ('auth failed')

            const verify = await bcrypt.compare(password, user.password)
            if (verify) {
                const payload = {
                    _id: user._id,
                    nim: user.nim,
                    is_admin: user.is_admin,
                    email: user.email,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60)
                }

                const token = jwt.sign(payload, KEY)

                if (token) {
                    res.status(200).json({
                        success: true,
                        message: "login success",
                        token: token
                    })
                } else {
                    throw ('auth failed')
                }

            } else {
                throw ('auth failed')
            }
        })
        .catch(err => {

            res.status(401).json({
                success: false,
                message: err
            })
        })
}

exports.user_detail = (req, res, next) => {
    User.findById(req.params.id, ['nim', 'name', 'photo', 'prodi', 'jurusan', 'faculty']).exec().then(result => {

            if (result) {
                res.status(200).json({
                    success: true,
                    data: result
                })
            } else {
                throw ('user not found');
            }

        })
        .catch(err => {
            res.status(404).send({
                success: false,
                message: err
            })
        })

}

exports.users_get = (req, res, next) => {
    User.find({}, ['nim', 'name', 'photo', 'prodi', 'jurusan', 'faculty']).then(result => {
            if (result.length == 0) {
                res.status(204).json({
                    success: true,
                    message: 'users is empty'
                })
            } else {
                res.status(200).json({
                    message: "list user",
                    data: result
                })
            }
        })
        .catch(err => {
            res.send(err)
        })
}

exports.user_delete = (req, res, next) => {
    User.deleteOne({
            _id: req.params.id
        }).then(result => {
            res.status(200).json({
                success: true,
                message: 'user deleted'
            })
        })
        .catch(err => {
            res.status(404).json({
                success: false,
                message: 'User not found'
            })
        })
}