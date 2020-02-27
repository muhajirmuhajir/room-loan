const router = require('express').Router();
const loanController = require('../controller/LoanController');
const {
    checkToken,
    documentUpload,
    checkUser,
    sendEmail
} = require('../middleware');

router.post('/', documentUpload, checkToken, loanController.create_loan)
router.get('/', loanController.all_loans)
router.get('/:id', loanController.detail_loan)
router.delete('/:id', checkToken, checkUser, loanController.delete_loan)
router.patch('/:id', checkToken, checkUser, loanController.confirmLoan, sendEmail)


module.exports = router