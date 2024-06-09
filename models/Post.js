// models/Post.js
const { DataTypes, Op } = require('sequelize');
const sequelize = require('../sequelize'); // Caminho correto para o arquivo sequelize.js

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

module.exports = { Post, Op };
