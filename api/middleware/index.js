require('dotenv').config()
const KEY = process.env.JWT_KEY
const jwt = require('jsonwebtoken')
const multer = require('multer');
const sgMail = require('@sendgrid/mail');

const uploadImage = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/images/')
        },
        filename: (req, file, cb) => {
            cb(null, new Date().getTime().toString() + '-' + file.originalname.replace(/\s/g, ''))
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
})


const uploadDocument = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/documents/')
        },
        filename: (req, file, cb) => {
            cb(null, new Date().getTime().toString() + '-' + file.originalname.replace(/\s/g, ''))
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }

})

module.exports = {
    checkToken: async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1]
            if (token) {
                try {
                    const payload = await jwt.verify(token, KEY)
                    if (payload) {
                        req.myreq = payload
                        next()
                    } else {
                        res.status(403)
                        const err = new Error('Access forbidden, please login')
                        next(err)
                    }
                } catch (err) {
                    res.status(500)
                    next(err)
                }
            }
        } else {
            res.status(403)
            const err = new Error("Access forbidden, please login")
            next(err)
        }
    },
    checkUser: async (req, res, next) => {
        const {
            is_admin
        } = req.myreq

        if (is_admin) {
            next()
        } else {
            res.status(403)
            const err = new Error("Access forbidden, you are not admin")
            next(err)
        }
    },
    imageUpload: uploadImage.single('roomfile'),
    documentUpload: uploadDocument.single('document'),
    sendEmail: (req, res, next) => {
        console.log(req.userId);
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const {
            is_accepted
        } = req.userId

        const msg = {
            to: 'hajir.nf@gmail.com',
            from: {
                name: 'PEMINJAMAN RUANGAN',
                email: 'noreply@room-loan.com'
            },
            subject: '[INFORMASI PEMINJAMAN RUANGAN]',
            text: 'and easy to do anywhere, even with Node.js',
            html: is_accepted ? '<strong>peminjaman ruangan anda di terima</strong>' : '<strong>peminjaman ruangan anda di tolak</strong>',
        };
        sgMail.send(msg).then(r => {
            res.status(200).json({
                success: true,
                message: is_accepted ? "Loan is Accpeted" : "Loan is Denied"
            })
        }).catch(e => {
            res.status(404).json({
                success: false,
                message: err
            })
        })

    }
}