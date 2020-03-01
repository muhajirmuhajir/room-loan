const router = require('express').Router();
const userController = require('../controller/UserController');
const {
    checkToken,
    checkUser
} = require('../middleware');

router.post('/register', userController.user_register);
router.post('/login', userController.user_login);
router.get('/', checkToken, checkUser, userController.users_get);
router.get('/:id', checkToken, userController.user_detail);
router.delete('/:id', checkToken, checkUser, userController.user_delete);

module.exports = router;