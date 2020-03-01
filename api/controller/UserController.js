require('dotenv').config()
const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const KEY = process.env.JWT_KEY
const validator = require('validator')
const puppeteer = require('puppeteer')

exports.user_register = async (req, res, next) => {
    const email = req.body.email
    const email_verify = validator.isEmail(email)
    const nim_req = req.body.nim
    const pass_req = req.body.password


    if (!email_verify) {
        res.status(401).json({
            success: false,
            message: "email not valid"
        })
    } else {
        const browser = await puppeteer.launch({
            headless: true
        })
        try {
            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36')

            await page.goto('https://em.ub.ac.id/apps/login.html?page=https://em.ub.ac.id/apps/profile.html')

            const nimElement = await page.$('input[name=nim]')
            await nimElement.type(nim_req)
            const passElement = await page.$('input[name=password]')
            await passElement.type(pass_req)

            await (await page.$('button[type=submit]')).click()

            const bio_name = await page.waitForSelector('h4#nama')


            const respon = await (await bio_name.getProperty('innerText')).jsonValue()

            if (respon === "You are a guest") {
                const newpage = await browser.newPage();
                await newpage.goto('https://em.ub.ac.id/apps/login.html?page=https://em.ub.ac.id/apps/profile.html')

                await newpage.$('.loginform')

                const nimElement1 = await newpage.$('input[name=nim]')
                await nimElement1.type(nim_req)
                const passElement1 = await newpage.$('input[name=password]')
                await passElement1.type(pass_req)

                const submitBtn1 = await newpage.$('button[type=submit]')
                await submitBtn1.click()

                const photo = await newpage.waitForSelector('img#foto')
                const name = await newpage.waitForSelector('h4#nama')
                const fakultas = await newpage.waitForSelector('h4#fak')

                const name_value = await (await name.getProperty('innerText')).jsonValue()
                const fak_value = await (await fakultas.getProperty('innerText')).jsonValue()
                const photo_url = await (await photo.getProperty('src')).jsonValue()

                newUser = new User({
                    photo: photo_url,
                    nim: nim_req,
                    name: name_value,
                    prodi: fak_value.split('/')[2],
                    jurusan: fak_value.split('/')[1],
                    faculty: fak_value.split('/')[0],
                    email: email
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
        } catch (e) {
            res.status(401).json({
                success: false,
                message: "akun siam tidak valid"
            })

        } finally {
            await browser.close()
        }


    }
}

exports.user_login = async (req, res, next) => {
    const password = req.body.password
    const nim = req.body.nim
    const browser = await puppeteer.launch({
        headless: true
    })
    try {
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36')

        await page.goto('https://em.ub.ac.id/apps/login.html?page=https://em.ub.ac.id/apps/profile.html')

        const nimElement = await page.$('input[name=nim]')
        await nimElement.type(nim)
        const passElement = await page.$('input[name=password]')
        await passElement.type(password)
        await (await page.$('button[type=submit]')).click()

        const bio_name = await page.waitForSelector('h4#nama')
        const respon = await (await bio_name.getProperty('innerText')).jsonValue()

        if (respon === "You are a guest") {
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
    } catch (e) {
        res.status(401).json({
            success: false,
            message: "auth failed, nim or password is incorrect"
        })

    } finally {
        await browser.close()
    }

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