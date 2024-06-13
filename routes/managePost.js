// routes/managePost.js
const express = require('express'); // Importa o framework Express para criação de aplicativos web
const { Post } = require('../models/Post'); // Importa o modelo de Post
const router = express.Router(); // Cria um roteador modular que pode manipular rotas separadamente
const authenticate = require('../middleware/authenticate'); // Middleware de autenticação

const POSTS_PER_PAGE = 12; // Número de posts por página

// Rota protegida para gerenciar posts
router.get('/', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1 se não especificada

    try {
        // Busca posts paginados ordenados por data de criação descendente
        const { count, rows: posts } = await Post.findAndCountAll({
            limit: POSTS_PER_PAGE, // Limite de posts por página
            offset: (page - 1) * POSTS_PER_PAGE, // Offset para paginar corretamente
            order: [['createdAt', 'DESC']] // Ordena por data de criação descendente
        });

        const totalPages = Math.ceil(count / POSTS_PER_PAGE); // Calcula o total de páginas

        // Renderiza a página de gerenciamento de posts com os posts, página atual e total de páginas
        res.render('managePost', { posts: posts.reverse(), page, totalPages });
    } catch (error) {
        console.error('Erro ao buscar posts:', error); // Log de erro no console
        res.status(500).send('Erro ao buscar posts.'); // Retorna status 500 em caso de erro
    }
});

module.exports = router; // Exporta o router para ser utilizado em outras partes da aplicação
