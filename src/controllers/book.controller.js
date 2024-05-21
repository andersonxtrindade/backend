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
        "SELECT * FROM projetolivros.troca WHERE id_livrodestinatario = $1",
        [book.id_livro]
      );
      
      book.trades =  trades.rows;
      book.opinions = opinions.rows;

      return successResponse(res, { book }, 'Consulta realizada com successo', 200);
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controlador para criar um novo usuário
const createBook = async (req, res) => {
  const { titulo, autor, genero, anopublicacao, status, id_usuario } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.livro(titulo, autor, genero, anopublicacao, status, id_usuario, datacadastro) VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *;",
      [titulo, autor, genero, anopublicacao, status, id_usuario]
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
    limit = 10,
    offset = 0,
  } = req.query;

  // Construir a consulta SQL dinamicamente com base nos parâmetros de filtro
  let query = "SELECT * FROM projetolivros.livro WHERE 1=1";
  let params = [];
  let paramIndex = 1;

  if (titulo) {
    query += ` AND titulo ILIKE $${paramIndex++}`;
    params.push(`%${titulo}%`);
  }
  if (autor) {
    query += ` AND autor ILIKE $${paramIndex++}`;
    params.push(`%${autor}%`);
  }
  if (genero) {
    query += ` AND genero ILIKE $${paramIndex++}`;
    params.push(`%${genero}%`);
  }
  if (anopublicacao) {
    query += ` AND anopublicacao = $${paramIndex++}`;
    params.push(anopublicacao);
  }
  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  query += ` ORDER BY datacadastro DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  try {
    const result = await db.query(query, params);
    return successResponse(res, result.rows, "Livros retornado com sucesso!");
  } catch (error) {
    console.error("Error searching books:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

// Controlador para atualizar a troca existente
const updateTrade = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.query(
      "UPDATE projetolivros.troca SET status = $1 WHERE id_troca = $2 RETURNING *",
      [status, id]
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
