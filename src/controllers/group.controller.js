const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Controlador para criar um novo grupo
const createGroup = async (req, res) => {
  const { nome, descricao, id_usuario, imagem } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.grupo(nome, descricao, id_dono, imagem) VALUES ($1, $2, $3, $4) RETURNING *;",
      [nome, descricao, id_usuario, imagem]
    );

    return successResponse(
      res,
      result.rows[0],
      "Cadastro realizado com successo",
      200
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

//Controlador para enviar publicações
const createPost = async (req, res) => {
  const { conteudo, id_grupo, id_usuario } = req.body;
  
  const imagem = req.file ? req.file.buffer : null;
  
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.publicacao(conteudo, data, id_grupo, id_usuario, imagem) VALUES ($1, now(), $2, $3, $4) RETURNING *;",
      [conteudo, id_grupo, id_usuario, imagem]
    );

    return successResponse(
      res,
      result.rows[0],
      "Cadastro realizado com successo",
      200
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

//Controlador para enviar reações
const createReact = async (req, res) => {
  const { tipo, id_publicacao, id_usuario } = req.body;
  try {
    const consult = await db.query('SELECT * FROM projetolivros.reacao WHERE id_publicacao = $1 and id_usuario = $2', [id_publicacao, id_usuario]);

    if (consult.rows.length === 0) {
      const result = await db.query(
        "INSERT INTO projetolivros.reacao( tipo, id_publicacao, id_usuario) VALUES ($1, $2, $3) RETURNING *;",
        [tipo, id_publicacao, id_usuario]
      );
  
      return successResponse(
        res,
        result.rows[0],
        "Cadastro realizado com successo",
        200
      );
    } else {
      let reacao = consult.rows[0]
      if (tipo === reacao.tipo) {
        return errorResponse(res, 'Falha no cadastro!', 'Você já curtiu isso, se quiser troque a reação!', 401);
      }

      const result = await db.query(
        "UPDATE projetolivros.reacao SET tipo = $1, id_publicacao = $2, id_usuario = $3 WHERE id_reacao = $4 RETURNING *;",
        [tipo, id_publicacao, id_usuario, reacao.id_reacao]
      );
  
      return successResponse(
        res,
        result.rows[0],
        "Alteração realizado com successo",
        200
      );
    }
    
  } catch (error) {
    console.error("Error creating react:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

//Controlador para enviar comentarios
const createComment = async (req, res) => {
  const { conteudo, id_publicacao, id_usuario } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.comentario(conteudo, data, id_publicacao, id_usuario) VALUES ($1, now(), $2, $3) RETURNING *;",
      [conteudo, id_publicacao, id_usuario]
    );

    return successResponse(
      res,
      result.rows[0],
      "Cadastro realizado com successo",
      200
    );        
  } catch (error) {
    console.error("Error creating react:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

// Controlador para obter os grupos
const getGroups = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM projetolivros.grupo WHERE 1 = 1"
    );
    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Erro ao consultar!",
        "Grupo não encontrado!",
        404
      );
    } else {
    
      for (const book of result.rows) {
        if (book.imagem) {
          book.imagem = book.imagem.toString('base64'); 
        }
      }

      return successResponse(res, result.rows, 'Consulta realizada com successo', 200);
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controlador para obter o grupo
const getGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM projetolivros.grupo WHERE id_grupo = $1",
      [groupId]
    );
    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Erro ao consultar!",
        "Grupo não encontrado!",
        404
      );
    } else {
    
      for (const book of result.rows) {
        if (book.imagem) {
          book.imagem = book.imagem.toString('base64'); 
        }
      }

      return successResponse(res, result.rows[0], 'Consulta realizada com successo', 200);
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controlador para obter um posts do grupo
const getPostsByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const result = await db.query(
      `SELECT pu.*, us.nome, count(re.*) as reacao
      FROM projetolivros.publicacao as pu 
      LEFT JOIN projetolivros.usuario as us ON (pu.id_usuario = us.id_usuario) 
      LEFT JOIN projetolivros.reacao as re ON (pu.id_publicacao = re.id_publicacao)
      WHERE pu.id_grupo = $1
      GROUP BY pu.id_publicacao, us.nome
      ORDER BY pu.id_publicacao DESC;`,
      [groupId]
    );
    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Erro ao consultar!",
        "Livro não encontrado!",
        404
      );
    } else {
      let post = result.rows

      for (const post of result.rows) {
        if (post.imagem) {
          post.imagem = post.imagem.toString('base64'); 
        }
  
        const commentsResult = await db.query(
          "SELECT co.*, us.nome FROM projetolivros.comentario as co LEFT JOIN projetolivros.usuario as us ON (co.id_usuario = us.id_usuario) WHERE id_publicacao = $1",
          [post.id_publicacao]
        );
  
        post.comments = commentsResult.rows || [];
      }
      
      return successResponse(res, post, 'Consulta realizada com successo', 200);
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createGroup,
  createPost,
  createReact,
  createComment,
  getGroups,
  getPostsByGroup,
  getGroup,
};
