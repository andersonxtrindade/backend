const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Controlador para criar um novo grupo
const createGroup = async (req, res) => {
  const { nome, descricao, id_usuario } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.grupo(nome, descricao, id_dono) VALUES ($1, $2, $3) RETURNING *;",
      [nome, descricao, id_usuario]
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
  try {
    const result = await db.query(
      "INSERT INTO projetolivros.publicacao(conteudo, data, id_grupo, id_usuario) VALUES ($1, now(), $2, $3) RETURNING *;",
      [conteudo, id_grupo, id_usuario]
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

module.exports = {
  createGroup,
  createPost,
  createReact,
  createComment,
};
