var jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        var token = req.headers.authorization.split(' ')[1];
        var decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        console.log(decoded)
        next()
    }catch (error){
        return res.status(401).json({
            message:"auth failed"
        });
    }

}