const Router = require("express")
const router = new Router()
const authController = require("../contoller/authController.js")
const {query, body} = require("express-validator")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

router.post('/registration',
    body('email').isEmail().withMessage('Введите корректный адрес электронной почты'),
    body('password').isLength({min: 5}).withMessage('Пароль должен содержать минимум 5 символов'),
    authController.registration)
router.post('/login',
    body('email').isEmail().withMessage('Введите корректный адрес электронной почты'),
    body('password').isLength({min: 5}).withMessage('Пароль должен содержать минимум 5 символов'),
    authController.login)
router.get('/users',
    roleMiddleware,
    query('userId').isInt().withMessage('Параметр "userId" должен быть целым числом'),
    authController.getAllUsers)
router.get('/self-info', authMiddleware, authController.getSelfInfo)
router.delete('/', roleMiddleware, authController.deleteUser)
router.get('/',
    roleMiddleware,
    query('userId').isInt().withMessage('Параметр "userId" должен быть целым числом'),
    authController.getUser)
router.put('/', roleMiddleware, authController.updateUser)

module.exports = router