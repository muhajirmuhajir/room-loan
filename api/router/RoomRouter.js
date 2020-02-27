const router = require('express').Router();
const roomController = require('../controller/RoomController');
const {
    checkToken,
    checkUser,
    imageUpload
} = require('../middleware');

router.get('/', roomController.get_all_room)
router.get('/:id', roomController.room_detail)
router.post('/', imageUpload, checkToken, checkUser, roomController.create_room)
router.delete('/:id', checkToken, checkUser, roomController.delete_room)
router.put('/:id', checkToken, checkUser, roomController.edit_room)


module.exports = router