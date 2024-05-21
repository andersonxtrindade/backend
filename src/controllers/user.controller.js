const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Controlador para obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projetolivros.usuario');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controlador para obter um usuário por ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM projetolivros.usuario WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controlador para criar um novo usuário
const createUser = async (req, res) => {
  const { nome, email, senha, tipo, token } = req.body;
  try {
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const result = await db.query('INSERT INTO projetolivros.usuario (nome, email, senha, dataregistro, tipo, token) VALUES ($1, $2, $3, now(), $4, $5) RETURNING *', [nome, email, hashedPassword, tipo, token]);
      
    return successResponse(res, result.rows[0], 'Cadastro realizado com successo', 200);
  } catch (error) {
    console.error('Error creating user:', error);
    return errorResponse(res, error.message, 'Internal Server Error', 500);
  }
};

// Controlador para atualizar um usuário existente
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome, email, tipo, token } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET nome = $1, email = $2, tipo = $3, token = $4 WHERE id = $5 RETURNING *',
      [nome, email, tipo, token, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controlador para excluir um usuário
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM projetolivros.usuario WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controlador para autenticar um usuário
const authenticateUser = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const result = await db.query('SELECT * FROM projetolivros.usuario WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'Autenticação falhou', 'Email ou senha está errado', 401);    
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (isMatch) {
      // Gerar um token aleatório
      const token = crypto.randomBytes(20).toString('hex');

      // Atualizar o usuário com o novo token
      const updateTokenResult = await db.query(
        'UPDATE projetolivros.usuario SET token = $1 WHERE id_usuario = $2 RETURNING *',
        [token, user.id_usuario]
      );
      
      return successResponse(res, { token, "user": user.id_usuario }, 'Autenticação realizada com successo', 200);
    } else {
      return errorResponse(res, 'Autenticação falhou', 'Email ou senha está errado', 401);   
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    return errorResponse(res, error.message, 'Internal Server Error', 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
};
