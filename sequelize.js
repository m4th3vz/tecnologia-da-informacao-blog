const { Sequelize } = require('sequelize');

// Configuração do Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' // caminho para o arquivo SQLite
});

// Testar conexão
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Conexão bem-sucedida com o banco de dados.');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
    }
}

testConnection(); // Testa a conexão ao iniciar o aplicativo

module.exports = sequelize;
