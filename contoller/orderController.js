const db = require('../db');
const orderUtils = require('../utils/commonUtils');

class OrderController {
    async placeOrder(req, res) {
        try {
            const userId = orderUtils.getUserIdFromToken(req);

            // Получение ID корзины пользователя
            const cartQuery = await db.query('SELECT cart_id FROM carts WHERE user_id = $1', [userId]);

            if (cartQuery.rows.length === 0) {
                return res.status(404).json({message: 'Корзина пользователя не найдена'});
            }

            const cartId = cartQuery.rows[0].cart_id;

            // Создание нового заказа
            const orderId = await orderUtils.createOrder(userId);

            // Перенос товаров из корзины в заказ
            await orderUtils.transferCartToOrder(cartId, orderId);

            // Очистка корзины пользователя (если нужно)
            const clearCartQuery = 'DELETE FROM cart_items WHERE cart_id = $1';
            await db.query(clearCartQuery, [cartId]);

            res.json({message: 'Заказ успешно оформлен'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async getUserOrders(req, res) {
        try {
            const userId = orderUtils.getUserIdFromToken(req);
            const userOrders = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
            res.json(userOrders.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async getAllOrders(req, res) {
        try {
            const allOrdersQuery = await db.query('SELECT * FROM orders');
            res.json(allOrdersQuery.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async updateOrder(req, res) {
        try {
            const {order_id, product_id, quantity} = req.body;

            if (!order_id || !product_id || !quantity) {
                return res.status(400).json({message: 'Не все обязательные параметры переданы'});
            }
            const updateOrderQuery = await db.query(
                'UPDATE order_items SET product_id = $1, quantity = $2 WHERE order_id = $3',
                [product_id, quantity, order_id]
            );
            if (updateOrderQuery.rowCount > 0) {
                res.json({message: 'Заказ успешно обновлен'});
            } else {
                res.status(404).json({message: 'Заказ не найден'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async deleteOrder(req, res) {
        try {
            const orderId = req.body.orderId;
            const deleteOrder = await db.query('DELETE FROM orders WHERE order_id = $1', [orderId]);
            if (deleteOrder.rowCount === 1) {
                res.json({message: 'Заказ успешно удален'});
            } else {
                res.status(404).json({message: 'Заказ не найден'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }
}

module.exports = new OrderController();
