const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUserData, loginStatus, updateUser, changePassword, forgotPassword } = require('../Controller/userController');
const protect = require('../Middleware/authMiddleware');

router.post('/register' , registerUser);
router.post('/login' , loginUser );
router.get('/logout' , logoutUser);
router.get('/getUser' , protect , getUserData);
router.get('/loginStatus' , loginStatus);
router.patch('/updateUser' , protect , updateUser);
router.patch('/changePassword' , protect , changePassword);
router.patch('/forgotPassword' , forgotPassword);

module.exports = router ;