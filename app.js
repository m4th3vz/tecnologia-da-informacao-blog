// app.js

const express = require('express');
const path = require('path');
const multer = require('multer');
const sequelize = require('./sequelize'); // Arquivo de configuração do Sequelize
const Post = require('./models/Post'); // Modelo de dados do Post

const app = express();

// Configuração do EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir arquivos estáticos (como CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para receber JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar o multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rota para a página inicial (lista de posts)
app.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.render('index', { posts });
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).send('Erro ao buscar posts.');
    }
});

// Rota para a página de criação de novo post
app.get('/create', (req, res) => {
    res.render('createPost');
});

// Rota para processar o formulário de criação de post
app.post('/create', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const imageURL = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const newPost = await Post.create({ title, content, imageURL });
        res.status(201).redirect('/');
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).send('Erro ao criar post.');
    }
});

// Rota para exibir um post específico
app.get('/post/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post não encontrado.');
        }
        res.render('post', { post });
    } catch (error) {
        console.error('Erro ao buscar post por ID:', error);
        res.status(500).send('Erro ao buscar post por ID.');
    }
});

// Rota para deletar um post
app.post('/delete/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post não encontrado.');
        }
        await post.destroy();
        res.status(200).redirect('/');
    } catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).send('Erro ao deletar post.');
    }
});

// Iniciar o servidor e sincronizar o banco de dados
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados com o banco de dados.');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error);
    }
}

startServer();
