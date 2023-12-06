const Router = require("express")
const router = new Router()
const productController = require("../contoller/productController")
const roleMiddleware = require("../middleware/roleMiddleware");
const {query} = require("express-validator");

router.get('/all', productController.getProducts)
router.get('/',
    query('productId').isInt().withMessage('Параметр "productId" должен быть целым числом'),
    productController.getProduct)
router.post('/add', roleMiddleware, productController.addProduct)
router.put('/update',
    roleMiddleware,
    query('productId').isInt().withMessage('Параметр "productId" должен быть целым числом'),
    productController.changeProduct)
router.delete('/delete',
    roleMiddleware,
    query('productId').isInt().withMessage('Параметр "productId" должен быть целым числом'),
    productController.deleteProduct)
module.exports = router