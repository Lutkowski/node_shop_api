const Router = require("express")
const router = new Router()
const cartController = require("../contoller/cartController")
const authMiddleware = require("../middleware/authMiddleware")
const {body} = require("express-validator");

router.post('/add',
    authMiddleware,
    body('productId').exists().withMessage('Поле "productId" обязательно'),
    body('quantity').exists().withMessage('Поле "quantity" обязательно'),
    cartController.addToCart)
router.delete('/delete',
    authMiddleware,
    body('productId').exists().withMessage('Поле "productId" обязательно'),
    cartController.deleteFromCart)
router.get('/contents',authMiddleware,cartController.getCart)

module.exports = router