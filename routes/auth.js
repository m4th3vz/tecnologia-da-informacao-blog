// routes/auth.js
const express = require('express'); // Importa o framework Express para criação de aplicativos web
const router = express.Router(); // Cria um roteador modular que pode manipular rotas separadamente

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota para processar o formulário de login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Lógica de autenticação
    if (username === 'admin' && password === 'illbeback+letv8gmFv1MVLa@$P2Goo') {
        req.session.userId = username; // Estabelece a sessão do usuário
        res.redirect('/managePost'); // Redireciona para a página de gerenciamento de posts após login bem-sucedido
    } else {
        res.status(401).send('Credenciais inválidas'); // Retorna status 401 se as credenciais estiverem incorretas
    }
});

// Rota para realizar o logout do usuário
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/'); // Redireciona para a página inicial após logout
    });
});

module.exports = router;
