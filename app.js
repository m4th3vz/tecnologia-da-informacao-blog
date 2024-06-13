// app.js
const express = require('express'); // Importa o framework Express para criação de aplicativos web
const path = require('path'); // Importa o módulo path para manipulação de caminhos de arquivos e diretórios
const multer = require('multer'); // Importa o multer para manipulação de upload de arquivos
const session = require('express-session'); // Importa o express-session para gerenciar sessões de usuário
const sequelize = require('./sequelize'); // Importa a configuração do Sequelize para conectar ao banco de dados
const favicon = require('serve-favicon'); // Importa o serve-favicon para servir o ícone de favorito

const app = express(); // Cria uma instância do aplicativo Express

// Configuração do EJS (template engine)
app.set('views', path.join(__dirname, 'views')); // Define o diretório de views
app.set('view engine', 'ejs'); // Define o EJS como o template engine

// Servir arquivos estáticos (como CSS)
app.use(express.static(path.join(__dirname, 'public'))); // Define o diretório de arquivos estáticos

// Middleware para receber JSON e dados de formulário
app.use(express.json()); // Permite receber dados no formato JSON
app.use(express.urlencoded({ extended: true })); // Permite receber dados de formulários

// Configuração da sessão
app.use(session({
    secret: 'AF#n2TPh2!8BeBp4=-6GTiG@RQPF6Ovpf5Yt0MZ2Sp-maAo_eZ', // Use uma chave forte
    resave: false, // Não salva a sessão se ela não foi modificada
    saveUninitialized: false // Não cria uma sessão para solicitações que não a modificam
}));

// Serve o favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // Define o caminho para o favicon

// Configurar o multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Define o diretório de destino dos arquivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Define o nome do arquivo com base na data e extensão original
    }
});
const upload = multer({ storage: storage }); // Configura o multer com o armazenamento definido

// Importar e usar as rotas
const indexRoutes = require('./routes/index'); // Importa as rotas do index
const managePostRoutes = require('./routes/managePost'); // Importa as rotas para gerenciamento de posts
const postRoutes = require('./routes/post'); // Importa as rotas para posts
const authRoutes = require('./routes/auth'); // Importa as rotas de autenticação
const searchRoutes = require('./routes/search'); // Importa as rotas de busca

app.use('/', indexRoutes); // Usa as rotas do index
app.use('/managePost', managePostRoutes); // Usa as rotas de gerenciamento de posts
app.use('/post', postRoutes); // Usa as rotas de posts
app.use('/auth', authRoutes); // Usa as rotas de autenticação
app.use('/search', searchRoutes); // Usa as rotas de busca

// Iniciar o servidor e sincronizar o banco de dados
async function startServer() {
    try {
        await sequelize.authenticate(); // Autentica a conexão com o banco de dados
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        await sequelize.sync({ alter: true }); // Sincroniza os modelos com o banco de dados
        console.log('Modelos sincronizados com o banco de dados.');

        const PORT = process.env.PORT || 3000; // Define a porta do servidor
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`); // Inicia o servidor e escuta na porta definida
        });
    } catch (error) {
        console.error('Erro ao iniciar o servidor:', error); // Loga qualquer erro que ocorra ao iniciar o servidor
    }
}

startServer(); // Chama a função para iniciar o servidor
