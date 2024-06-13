// middleware/authenticate.js
const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        next(); // Usuário autenticado
    } else {
        res.redirect('/auth/login'); // Redirecionar para a página de login se não autenticado
    }
};

module.exports = authenticate;
