// routes/search.js
const express = require('express'); // Importa o framework Express para criação de aplicativos web
const { Post, Op } = require('../models/Post'); // Importa o modelo Post e o operador Op do Sequelize
const router = express.Router(); // Cria um roteador modular que pode manipular rotas separadamente

// Rota GET para buscar posts com base em um termo de pesquisa
router.get('/', async (req, res) => {
    const query = req.query.q; // Obtém o termo de pesquisa da query string

    try {
        const posts = await Post.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } }, // Busca por título que contenha o termo de pesquisa
                    { content: { [Op.like]: `%${query}%` } } // Busca por conteúdo que contenha o termo de pesquisa
                ]
            },
            order: [['createdAt', 'DESC']] // Ordena os resultados por data de criação descendente
        });

        res.render('searchResults', { posts, query }); // Renderiza a página de resultados de pesquisa com os posts encontrados e o termo de pesquisa
    } catch (error) {
        console.error('Erro ao buscar posts:', error); // Log de erro no console em caso de falha na busca
        res.status(500).send('Erro ao buscar posts.'); // Retorna status 500 em caso de erro
    }
});

module.exports = router; // Exporta o router para ser utilizado em outras partes da aplicação
