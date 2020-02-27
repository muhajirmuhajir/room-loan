const router = require('express').Router();
const userRouter = require('./UserRouter');
const loanRouter = require('./LoanRouter');
const roomRouter = require('./RoomRouter');

router.use('/user', userRouter);
router.use('/loan', loanRouter);
router.use('/room', roomRouter);



router.use(notFound)
router.use(errorHandler)

function notFound(req, res, next) {
    res.status(404)
    const err = new Error("Page not found!")
    next(err)
}

function errorHandler(err, req, res, next) {
    res.status(res.statusCode || 500)
    const message = err.message || "Internal server error"
    res.json({
        success: false,
        message: message
    })
}

module.exports = router;