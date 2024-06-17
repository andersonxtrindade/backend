const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Controlador para obter um usuário por ID
const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM projetolivros.livro WHERE id_livro = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Erro ao consultar!",
        "Livro não encontrado!",
        404
      );
    } else {
      let book = result.rows[0]
      const opinions = await db.query(
        "SELECT * FROM projetolivros.opiniao WHERE id_livro = $1",
        [book.id_livro]
      );

      const trades = await db.query(
        "SELECT tr.*, us.nome as remetente FROM projetolivros.troca as tr LEFT JOIN projetolivros.usuario as us ON (tr.id_remete = us.id_usuario) WHERE tr.id_livrodestinatario = $1",
        [book.id_livro]
      );

      const user = await db.query(
        "SELECT * FROM projetolivros.usuario WHERE id_usuario = $1",
        [book.id_usuario]
      );
    
      for (const book of result.rows) {
        if (book.imagem) {
          book.imagem = book.imagem.toString('base64'); 
        }
      }

      book.trades = trades.rows;
      book.opinions = opinions.rows;
      book.user = user.rows[0];

      return successResponse(res, { book }, 'Consulta realizada com successo', 200);
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controlador para criar um novo usuário
const createBook = async (req, res) => {
  const { titulo, autor, genero, anopublicacao, conteudo } = req.body;
  
  const imagem = req.file ? req.file.buffer : null;
  
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  const tokenParts = authorizationHeader.split(' ');
  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid authorization header' });
  }

  const usuarioToken = tokenParts[1];
  try {
    
    const resultUser = await db.query(
        "SELECT id_usuario FROM projetolivros.usuario WHERE token = $1;",
        [usuarioToken]
    );
    
    if (resultUser.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid user token' });
    }
    
    const id_usuario = resultUser.rows[0].id_usuario;

    const result = await db.query(
      "INSERT INTO projetolivros.livro(titulo, autor, genero, anopublicacao, status, id_usuario, datacadastro, conteudo, imagem) VALUES ($1, $2, $3, $4, 'Pendente', $5, now(), $6, $7) RETURNING *;",
      [titulo, autor, genero, anopublicacao, id_usuario, conteudo, imagem]
    );

    return successResponse(
      res,
      result.rows[0],
      "Cadastro realizado com successo",
      200
    );
  } catch (error) {
    console.error("Error creating book:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

// Controlador para buscar livros com filtro e paginação
const searchBooks = async (req, res) => {
  const {
    titulo,
    autor,
    genero,
    anopublicacao,
    status,
    usuario,
    limit = 10,
    offset = 0,
  } = req.query;

  // Construir a consulta SQL dinamicamente com base nos parâmetros de filtro
  let query = "SELECT li.*, us.nome FROM projetolivros.livro as li LEFT JOIN projetolivros.usuario as us ON (li.id_usuario = us.id_usuario) WHERE 1=1";
  let params = [];
  let paramIndex = 1;

  if (titulo) {
    query += ` AND li.titulo ILIKE $${paramIndex++}`;
    params.push(`%${titulo}%`);
  }
  if (autor) {
    query += ` AND li.autor ILIKE $${paramIndex++}`;
    params.push(`%${autor}%`);
  }
  if (genero) {
    query += ` AND li.genero ILIKE $${paramIndex++}`;
    params.push(`%${genero}%`);
  }
  if (anopublicacao) {
    query += ` AND li.anopublicacao = $${paramIndex++}`;
    params.push(anopublicacao);
  }
  if (status) {
    query += ` AND li.status = $${paramIndex++}`;
    params.push(status);
  }
  if (usuario) {
    query += ` AND li.id_usuario = $${paramIndex++}`;
    params.push(usuario);
  }

  query += ` ORDER BY li.id_livro DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  try {
    const result = await db.query(query, params);
    
    for (const book of result.rows) {
      if (book.imagem) {
        book.imagem = book.imagem.toString('base64'); 
      }
    }

    return successResponse(res, result.rows, "Livros retornado com sucesso!");
  } catch (error) {
    console.error("Error searching books:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

// Controlador para atualizar a troca existente
const updateTrade = async (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;
  
  try {
    const result = await db.query(
      "UPDATE projetolivros.livro SET ativo = $1 WHERE id_livro = $2 RETURNING *",
      [ativo, id]
    );
    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Falha no cadastro!",
        "Livro não encontrado!",
        404
      );
    } else {
      return successResponse(
        res,
        result.rows[0],
        "Atualização realizada com successo",
        200
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

module.exports = {
  getBookById,
  createBook,
  searchBooks,
  updateTrade,
};
