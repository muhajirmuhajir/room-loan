require('dotenv').config()
const Room = require('../model/roomModel');
const fs = require('fs');
const BASE_URL = process.env.URL

exports.room_detail = (req, res, next) => {
    Room.findById(req.params.id).exec()
        .then(result => {
            if (!result) throw ('Room not found')

            res.status(200).json({
                success: true,
                data: result
            })
        })
        .catch(err => {
            res.status(404).json({
                success: false,
                message: err
            })
        })
}

exports.get_all_room = (req, res, next) => {
    Room.find({}).then(result => {
        if (!result[0]) throw ('Room is empty')

        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        })
    }).catch(err => {
        res.status(404).send({
            success: false,
            message: err
        })
    })
}

exports.delete_room = (req, res, next) => {
    Room.findByIdAndDelete({
            _id: req.params.id
        }).exec()
        .then(result => {
            if (!result) throw ('Room not found')

            const path = result.photo.split('/')[4]

            fs.unlink('uploads/' + path, () => {
                res.status(200).json({
                    success: true,
                    message: 'room deleted'
                })
            })
        })
        .catch(err => {
            res.status(404).json({
                success: false,
                message: err
            })
        })
}

exports.create_room = (req, res, next) => {
    const newRoom = new Room({
        gedung: req.body.gedung,
        lantai: req.body.lantai,
        room_name: req.body.room_name,
        photo: BASE_URL + "/r/" + req.file.filename
    })

    Room.create(newRoom).then(result => {
        res.status(200).json({
            success: true,
            message: 'room created'
        })
    }).catch(err => {
        res.status(404).json({
            success: false,
            message: 'request not valid'
        })
    })
}

exports.edit_room = (req, res, next) => {
    Room.findById(req.params.id).then(result => {
        if (!result) throw ('Room not found')

        const {
            gedung,
            lantai,
            room_name
        } = {
            gedung: req.body.newGedung ? req.body.newGedung : result.gedung,
            lantai: req.body.newLantai ? req.body.newLantai : result.lantai,
            room_name: req.body.newName ? req.body.newName : result.room_name
        }
        result.gedung = gedung
        result.lantai = lantai
        result.room_name = room_name

        result.save().then(() => {
            res.status(200).json({
                success: true,
                message: 'Room updated'
            })
        })
    }).catch(err => {
        res.status(404).json({
            success: false,
            message: err
        })
    })

}