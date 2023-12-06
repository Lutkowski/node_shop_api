const {secretKey} = require('../config')
const {verify} = require("jsonwebtoken");
module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({message: "Пользователь не авторизован"})
        }
        const {role} = verify(token, secretKey)
        if (role !== "admin") {
            return res.status(403).json({message: "Нет доступа"})
        }
        next()
    } catch (error) {
        console.error(error);
        return res.status(401).json({message: 'Ошибка аутентификации'});
    }
};