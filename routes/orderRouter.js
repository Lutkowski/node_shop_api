const Router = require("express")
const router = new Router()
const orderController = require("../contoller/orderController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {body} = require("express-validator");

router.post('/place', authMiddleware, orderController.placeOrder)
router.get('/user', authMiddleware, orderController.getUserOrders)
router.get('/all', roleMiddleware, orderController.getAllOrders)
router.put('/update', roleMiddleware, orderController.updateOrder)
router.delete('/delete',
    roleMiddleware,
    body('orderId').exists().withMessage('Поле "orderId" обязательно'),
    orderController.deleteOrder)

module.exports = router