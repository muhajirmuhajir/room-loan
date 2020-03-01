require('dotenv').config()
const Loan = require('../model/loanModel');
const monggose = require('mongoose');
const fs = require('fs');
const BASE_URL = process.env.URL

exports.create_loan = (req, res, next) => {
    const uid = req.body.user_id
    const roomsId = req.body.rooms_id.split(" ")

    const filename = req.file.filename
    const startTime = new Date(req.body.start_time).getTime()
    const endTime = new Date(req.body.end_time).getTime()
    const dateOfLoan = new Date(req.body.start_time).getDay()

    /*
    sebelum membuat transaksi, lakukan pengecekan ruangan apakah ruangan tersebut dipakai atau tidak
    
    cek hari dan ruangan
    cek jam
    */
    Loan.find({
        date_of_loan: dateOfLoan,
        is_accepted: true,
        rooms_id: {
            $all: roomsId
        }
    }).then(loans => {
        if (loans) {
            /* cek waktu mulai */
            var withinRange = true
            for (var loan of loans) {
                var from = new Date(loan.start_time).getTime();
                var to = new Date(loan.end_time).getTime();
                withinRange = startTime >= from && startTime <= to;
                if (withinRange) throw ('[1]ruangan telah dipakai yaitu ' + loan._id)
            }
        }
        return loans

    }).then(loans => {
        if (loans) {
            /* cek waktu selesai */
            var withinRange = true
            for (var loan of loans) {
                var from = new Date(loan.start_time).getTime();
                var to = new Date(loan.end_time).getTime();
                withinRange = endTime >= from && endTime <= to;
                if (withinRange) throw ('[2]ruangan telah dipakai yaitu ' + loan._id)
            }
        }
        return loans

    }).then(loans => {
        if (loans) {
            /* cek A < ST && B > ET */
            var withinRange = true
            for (var loan of loans) {
                var from = new Date(loan.start_time).getTime();
                var to = new Date(loan.end_time).getTime();
                withinRange = startTime <= from && endTime >= to;
                if (withinRange) throw ('[3]ruangan telah dipakai yaitu ' + loan._id)
            }
        }
        return loans
    }).then(result => {
        // start to save
        if (uid && roomsId.length > 0) {
            const userId = monggose.Types.ObjectId(uid)
            var listRooms = []
            for (var i = 0; i < roomsId.length; i++) {
                listRooms[i] = monggose.Types.ObjectId(roomsId[i])
            }
            if (!filename) filename = "-"

            Loan.create({
                user_id: userId,
                rooms_id: listRooms,
                start_time: startTime,
                end_time: endTime,
                date_of_loan: dateOfLoan,
                repeat: req.body.repeat,
                document: BASE_URL + "/d/" + filename
            }).then(result => {
                res.status(200).json({
                    success: true,
                    message: 'loan created'
                })
            }).catch(err => {
                res.status(404).json({
                    success: false,
                    message: 'request not valid'
                })
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'request not valid'
            })
        }

    }).catch(err => {
        res.status(403).json(err)
    })




}

exports.all_loans = (req, res, next) => {

    Loan.find({}).lean()
        .populate("rooms_id", "room_name lantai gedung")
        .populate("user_id", "name nim")
        .exec()
        .then(result => {
            res.status(200).json({
                success: true,
                count: result.length,
                data: result
            })
        })
        .catch(err => {
            res.send('error')
        })
}

exports.detail_loan = (req, res, next) => {
    const id = req.params.id;
    Loan.findById(id).lean()
        .populate("rooms_id", "room_name lantai gedung")
        .populate("user_id", "name nim")
        .exec().then(loan => {
            if (!loan) throw ('request not valid')

            res.status(200).json({
                success: true,
                data: loan
            })
        }).catch(err => {
            res.status(404).json({
                success: false,
                message: err
            })
        })
}

exports.delete_loan = (req, res, next) => {
    const id = req.params.id;
    Loan.findByIdAndDelete({
        _id: id
    }).then(loan => {
        if (!loan) throw ('request not valid')


        const p = loan.document.split('/')[4]

        fs.unlink('documents/' + p, () => {
            res.status(200).json({
                success: true,
                message: 'loan deleted'
            })
        })

    }).catch(err => {
        res.status(404).json({
            success: false,
            message: err
        })
    })
}

exports.confirmLoan = (req, res, next) => {
    const id = req.params.id
    const is_accepted = req.body.is_accepted

    if (typeof is_accepted === "boolean") {
        Loan.findByIdAndUpdate(id, {
            is_accepted: is_accepted,
            status: is_accepted ? "diterima" : "ditolak"
        }).lean().then(result => {
            if (!result) throw ('invalid request')

            req.userId = {
                userId: result.user_id,
                is_accepted: is_accepted
            }
            next()

        }).catch(err => {
            next(err)
        })
    } else {
        next(Error('invalid request'))
    }
}