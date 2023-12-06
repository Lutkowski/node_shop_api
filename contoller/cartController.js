const db = require('../db')
const orderUtils = require("../utils/commonUtils");

class CartController {
    async addToCart(req, res) {
        try {
            const userId = orderUtils.getUserIdFromToken(req);
            const {productId, quantity} = req.body;

            const cart = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

            if (cart.rows.length === 0) {
                const newCart = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
            }
            const cartIdQuery = await db.query('SELECT cart_id FROM carts')
            const cartId = cartIdQuery.rows[0].cart_id
            const product = await db.query('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);

            if (product.rows.length === 0) {
                await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)', [cartId, productId, quantity]);
            } else {
                await db.query('UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3', [quantity, cartId, productId]);
            }

            res.json({message: 'Товар добавлен в корзину'});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async deleteFromCart(req, res) {
        try {
            const userId = orderUtils.getUserIdFromToken(req);
            const {productId} = req.body;

            const cart = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
            if (cart.rows.length === 0) {
                return res.status(404).json({message: 'Корзина пользователя не найдена'});
            }
            const cartId = cart.rows[0].cart_id

            await db.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);

            res.json({message: 'Товар удален из корзины'});

        } catch (e) {
            console.error(e);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async getCart(req, res) {
        try {
            const userId = orderUtils.getUserIdFromToken(req);

            const cart = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
            if (cart.rows.length === 0) {
                return res.status(404).json({message: 'Корзина пользователя не найдена'});
            }
            const cartId = cart.rows[0].cart_id
            const cartItems = await db.query('SELECT * FROM cart_items WHERE cart_id=$1', [cartId])
            if (cartItems.rows.length === 0) {
                res.json({message: "Корзина пуста"})
            } else {
                res.json(cartItems.rows)
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }
}

module.exports = new CartController()