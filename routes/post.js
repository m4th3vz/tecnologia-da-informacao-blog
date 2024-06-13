// routes/post.js
const express = require('express'); // Importa o framework Express para criação de aplicativos web
const { Post } = require('../models/Post'); // Importa o modelo de Post
const multer = require('multer'); // Importa o multer para upload de arquivos
const path = require('path'); // Importa o módulo path para manipulação de caminhos de arquivos e diretórios
const router = express.Router(); // Cria um roteador modular que pode manipular rotas separadamente
const authenticate = require('../middleware/authenticate'); // Middleware de autenticação

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Define o diretório de destino para os uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Define o nome do arquivo usando timestamp e extensão original
    }
});
const upload = multer({ storage: storage }); // Configura o middleware de upload com o storage definido

// Rota GET para exibir o formulário de criação de post
router.get('/create', authenticate, (req, res) => {
    res.render('createPost'); // Renderiza o formulário de criação de post
});

// Rota POST para criar um novo post
router.post('/create', authenticate, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const imageURL = req.file ? `/uploads/${req.file.filename}` : null; // URL da imagem se houver upload
    try {
        const newPost = await Post.create({ title, content, imageURL }); // Cria um novo post no banco de dados
        res.status(201).redirect('/managePost'); // Redireciona para a página de gerenciamento de posts após a criação do post
    } catch (error) {
        console.error('Erro ao criar post:', error); // Log de erro no console
        res.status(500).send('Erro ao criar post.'); // Retorna status 500 em caso de erro
    }
});

// Rota GET para exibir um post específico por ID
router.get('/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId); // Busca o post pelo ID no banco de dados
        if (!post) {
            return res.status(404).send('Post não encontrado.'); // Retorna 404 se o post não existir
        }
        res.render('post', { post }); // Renderiza a página do post encontrado
    } catch (error) {
        console.error('Erro ao buscar post por ID:', error); // Log de erro no console
        res.status(500).send('Erro ao buscar post por ID.'); // Retorna status 500 em caso de erro
    }
});

// Rota POST para deletar um post por ID
router.post('/delete/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId); // Busca o post pelo ID no banco de dados
        if (!post) {
            return res.status(404).send('Post não encontrado.'); // Retorna 404 se o post não existir
        }
        await post.destroy(); // Deleta o post do banco de dados
        res.status(200).redirect('/managePost'); // Redireciona para a página de gerenciamento após deletar o post
    } catch (error) {
        console.error('Erro ao deletar post:', error); // Log de erro no console
        res.status(500).send('Erro ao deletar post.'); // Retorna status 500 em caso de erro
    }
});

// Rota GET para exibir o formulário de edição de um post por ID
router.get('/edit/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId); // Busca o post pelo ID no banco de dados
        if (!post) {
            return res.status(404).send('Post não encontrado.'); // Retorna 404 se o post não existir
        }
        res.render('editSinglePost', { post }); // Renderiza o formulário de edição do post encontrado
    } catch (error) {
        console.error('Erro ao buscar post por ID:', error); // Log de erro no console
        res.status(500).send('Erro ao buscar post por ID.'); // Retorna status 500 em caso de erro
    }
});

// Rota POST para editar um post por ID
router.post('/edit/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    try {
        const post = await Post.findByPk(postId); // Busca o post pelo ID no banco de dados
        if (!post) {
            return res.status(404).send('Post não encontrado.'); // Retorna 404 se o post não existir
        }
        post.title = title; // Atualiza o título do post
        post.content = content; // Atualiza o conteúdo do post
        await post.save(); // Salva as alterações no banco de dados
        res.status(200).redirect('/managePost'); // Redireciona para a página de gerenciamento após editar o post
    } catch (error) {
        console.error('Erro ao editar post:', error); // Log de erro no console
        res.status(500).send('Erro ao editar post.'); // Retorna status 500 em caso de erro
    }
});

module.exports = router; // Exporta o router para ser utilizado em outras partes da aplicação
