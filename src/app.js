// app.js
const express = require('express');
const app = express();
const errorHandler = require('./middlewares/errorHandler');

// Middleware para fazer o parse do corpo das requisições
app.use(express.json());

// Rotas
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

const bookRoutes = require('./routes/book.routes');
app.use('/api/books', bookRoutes);

const opinionRoutes = require('./routes/opinion.routes');
app.use('/api/opinions', opinionRoutes);

const tradeRoutes = require('./routes/trade.routes');
app.use('/api/trades', tradeRoutes);

const groupRoutes = require('./routes/group.routes');
app.use('/api/groups', groupRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;
