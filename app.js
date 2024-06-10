// app.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const session = require('express-session'); // Adicionado para sessões
const sequelize = require('./sequelize'); // Arquivo de configuração do Sequelize
const { Post, Op } = require('./models/Post'); // Modelo de dados do Post
const favicon = require('serve-favicon');

const app = express();

// Configuração do EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Servir arquivos estáticos (como CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para receber JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da sessão
app.use(session({
    secret: 'AF#n2TPh2!8BeBp4=-6GTiG@RQPF6Ovpf5Yt0MZ2Sp-maAo_eZ', // Use uma chave forte
    resave: false,
    saveUninitialized: false
}));

// Middleware de autenticação
const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        next(); // Usuário autenticado
    } else {
        res.redirect('/login'); // Redirecionar para a página de login se não autenticado
    }
};

// Serve o favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Outras configurações e middlewares
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

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

// Constante para definir a quantidade de posts por página
const POSTS_PER_PAGE = 12;

// Rota para a página inicial (lista de posts)
app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1

    try {
        const { count, rows: posts } = await Post.findAndCountAll({
            limit: POSTS_PER_PAGE,
            offset: (page - 1) * POSTS_PER_PAGE,
            order: [['createdAt', 'DESC']] // Ordena por data de criação, mais recente primeiro
        });

        const totalPages = Math.ceil(count / POSTS_PER_PAGE);

        res.render('index', { posts: posts.reverse(), page, totalPages }); // Inverte a ordem dos posts para exibir os mais recentes primeiro
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).send('Erro ao buscar posts.');
    }
});

// Rota para a página de gerenciamento (protegida por autenticação)
app.get('/managePost', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1

    try {
        const { count, rows: posts } = await Post.findAndCountAll({
            limit: POSTS_PER_PAGE,
            offset: (page - 1) * POSTS_PER_PAGE,
            order: [['createdAt', 'DESC']] // Ordena por data de criação, mais recente primeiro
        });

        const totalPages = Math.ceil(count / POSTS_PER_PAGE);

        res.render('managePost', { posts: posts.reverse(), page, totalPages }); // Inverte a ordem dos posts para exibir os mais recentes primeiro
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).send('Erro ao buscar posts.');
    }
});

// Rota para a página de criação de novo post (protegida por autenticação)
app.get('/create', authenticate, (req, res) => {
    res.render('createPost');
});

// Rota para a página sobre
app.get('/about', (req, res) => {
    res.render('about');
});

// Rota para processar o formulário de criação de post (protegida por autenticação)
app.post('/create', authenticate, upload.single('image'), async (req, res) => {
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

// Rota para deletar um post (protegida por autenticação)
app.post('/delete/:id', authenticate, async (req, res) => {
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

// Rota para a página de edição de um post específico (protegida por autenticação)
app.get('/edit/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post não encontrado.');
        }
        res.render('editSinglePost', { post });
    } catch (error) {
        console.error('Erro ao buscar post por ID:', error);
        res.status(500).send('Erro ao buscar post por ID.');
    }
});

// Rota para processar o formulário de edição de um post (protegida por autenticação)
app.post('/edit/:id', authenticate, async (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post não encontrado.');
        }
        post.title = title;
        post.content = content;
        await post.save();
        res.status(200).redirect('/');
    } catch (error) {
        console.error('Erro ao editar post:', error);
        res.status(500).send('Erro ao editar post.');
    }
});

// Rota de login
app.get('/login', (req, res) => {
    res.render('login'); // Renderiza a página de login
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Exemplo simples de autenticação (substitua pela sua lógica de autenticação)
    if (username === 'admin' && password === 'illbeback+letv8gmFv1MVLa@$P2Goo') {
        req.session.userId = username; // Estabelece a sessão
        res.redirect('/managePost'); // Redireciona para a página de gerenciamento de posts
    } else {
        res.status(401).send('Credenciais inválidas');
    }
});

// Rota de logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/'); // Redireciona para a página inicial após logout
    });
});

// Rota para a pesquisa de posts
app.get('/search', async (req, res) => {
    const query = req.query.q; // O termo de pesquisa é passado como parâmetro de consulta

    try {
        const posts = await Post.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { content: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        res.render('searchResults', { posts, query }); // Renderiza uma visão de resultados de pesquisa
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).send('Erro ao buscar posts.');
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
