const db = require('../db');

async function transferCartToOrder(cartId, orderId) {
    // Перенос товаров из cart_items в order_items
    const transferQuery = `
        INSERT INTO order_items (order_id, product_id, quantity)
        SELECT $1, product_id, quantity FROM cart_items
        WHERE cart_id = $2
    `;
    await db.query(transferQuery, [orderId, cartId]);
}

async function createOrder(userId) {
    // Создание новой записи в таблице orders
    const createOrderQuery = 'INSERT INTO orders (user_id) VALUES ($1) RETURNING order_id';
    const orderResult = await db.query(createOrderQuery, [userId]);
    return orderResult.rows[0].order_id;
}

function getUserIdFromToken(req) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        throw new Error('Отстутствует токен')
    }

    const userId = verify(token, secretKey).id;
    return userId;
}

module.exports = {transferCartToOrder, createOrder, getUserIdFromToken};