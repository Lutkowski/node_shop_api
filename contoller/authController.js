const db = require('../db')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const {secretKey} = require('../config')
const {verify} = require("jsonwebtoken");
const orderUtils = require("../utils/commonUtils");
const generateAccessToken = (id, fullName, role) => {
    const payload = {
        id,
        fullName,
        role,
    }
    return jwt.sign(payload, secretKey, {expiresIn: "24h"})
}

class AuthController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Ошибка регистрации", errors})
            }
            const {fullName, email, password, role='user'} = req.body
            const candidate = await db.query("SELECT * FROM users WHERE email=$1", [email])
            if (candidate.rows.length > 0) {
                return res.status(400).json({message: "Пользователь с таким email уже существует"});
            }
            const hashPassword = bcrypt.hashSync(password, 6)
            const newUser = await db.query("INSERT INTO users (full_name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *", [fullName, email, hashPassword, role])
            return res.json({message: "Пользователь был сохранен"})
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body
            const user = await db.query('SELECT * FROM users WHERE email=$1', [email])
            if (!user.rows.length) {
                return res.status(400).json({message: `Пользователь с email: ${email} не найден`})
            }
            const isValidPassword = bcrypt.compareSync(password, user.rows[0].password)
            if (!isValidPassword) {
                return res.status(400).json({message: "Введен неверный пароль"})
            }
            const token = generateAccessToken(user.rows[0].user_id, user.rows[0].full_name, user.rows[0].role)
            return res.json({token})
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await db.query('SELECT * FROM users')
            res.json(users.rows)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    async getSelfInfo(req, res) {
        try {

            const userId = orderUtils.getUserIdFromToken(req);

            const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);

            if (!user.rows.length) {
                return res.status(404).json({message: 'Пользователь не найден'});
            }

            res.json(user.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    async deleteUser(req, res) {
        try {

            const userId = req.query.userId;

            const deletedUser = await db.query('DELETE FROM users WHERE user_id = $1 AND role = $2 RETURNING *', [userId, 'user']);

            if (!deletedUser.rows.length) {
                return res.status(404).json({ message: 'Покупатель не найден' });
            }
            res.json({ message: 'Покупатель успешно удален' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }
    async getUser(req, res) {
        try {
            const userId = req.query.userId;

            const user = await db.query('SELECT * FROM users WHERE user_id = $1 AND role = $2', [userId, 'user']);

            if (!user.rows.length) {
                return res.status(404).json({ message: 'Покупатель не найден' });
            }

            res.json(user.rows[0]);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }
    async updateUser(req, res) {
        try {
            const { user_id, full_name, email, password } = req.body;

            if (!full_name && !email && !password) {
                return res.status(400).json({ message: 'Не переданы данные для обновления' });
            }
            const currentUser = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);

            if (!currentUser.rows.length) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const updatedUser = await db.query(
                'UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), password = COALESCE($3, password)  WHERE user_id = $4 RETURNING *',
                [full_name, email, password, user_id]
            );

            res.json(updatedUser.rows[0]);
        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }
}

module.exports = new AuthController()