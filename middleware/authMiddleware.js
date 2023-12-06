const jwt = require('jsonwebtoken')
const {verify} = require("jsonwebtoken");
const {secretKey} = require('../config')
module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({message: "Пользователь не авторизован"})
        }
        const decodedData = verify(token, secretKey)
        req.user = decodedData
        next()
    } catch (error) {
        console.error(error);
        return res.status(401).json({message: 'Ошибка аутентификации'});
    }
};