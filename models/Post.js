// models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Ajuste o caminho conforme necessário

const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageURL: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Post;
