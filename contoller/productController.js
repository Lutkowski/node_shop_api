const db = require('../db')

class ProductController {
    async getProduct(req, res) {
        try {
            const productId = req.query.id
            if (!productId) {
                return res.status(400).json({message: "Ошибка получения товара"})
            }
            const product = await db.query('SELECT * FROM products WHERE product_id=$1', [productId])
            if (!product) {
                return res.status(400).json({message: "Ошибка получения товара"})
            }
            res.json(product.rows[0])
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async getProducts(req, res) {
        try {
            const products = await db.query('SELECT * FROM products')
            res.json(products.rows)
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async addProduct(req, res) {
        try {
            const {name, manufacturer, type, price, description} = req.body
            if (!name || !manufacturer || !type || !price) {
                return res.status(400).json({message: "Заполните необходимые поля"});
            }
            const result = await db.query(
                'INSERT INTO products (name, manufacturer, type, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, manufacturer, type, price, description]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }

    }

    async changeProduct(req, res) {
        try {
            const productId = req.query.id;
            const {name, manufacturer, type, price, description} = req.body;
            if (!productId || !name || !manufacturer || !type || !price) {
                return res.status(400).json({message: "Заполните необходимые поля"});
            }
            const result = await db.query(
                'UPDATE products SET name = $2, manufacturer = $3, type = $4, price = $5, description = $6 WHERE product_id = $1 RETURNING *',
                [productId, name, manufacturer, type, price, description]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({message: "Товар не найден"});
            }
            res.json(result.rows[0]);

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

    async deleteProduct(req, res) {
        try {
            const productId = req.query.id;
            const result = await db.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [productId]);
            if (result.rows.length === 0) {
                return res.status(404).json({message: "Товар не найден"});
            }
            res.json({message: "Товар удален"});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Внутренняя ошибка сервера'});
        }
    }

}

module.exports = new ProductController()