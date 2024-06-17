const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Controlador para criar um novo opinião
const createOpinion = async (req, res) => {
  const { conteudo, id_usuario, id_livro } = req.body;
  try {
    const select = await db.query(
      "SELECT * FROM projetolivros.livro WHERE id_livro = $1 and id_usuario = $2;",
      [id_livro, id_usuario]
    );
    if (select.rows.length === 0) {
        return errorResponse(res, 'Falha no cadastro!', 'Você não é o dono desse livro', 401); 
    } 
    const selectOpinion = await db.query(
      "SELECT * FROM projetolivros.opiniao WHERE id_livro = $1;",
      [id_livro]
    );
    
    if(selectOpinion.rows.length === 1) {
      return errorResponse(res, 'Falha no cadastro!', 'Você já deu sua opinião sobre esse livro', 401);
    } else {
      const result = await db.query(
        "INSERT INTO projetolivros.opiniao(conteudo, data, id_usuario, id_livro) VALUES ($1, now(), $2, $3) RETURNING *;",
        [conteudo, id_usuario, id_livro]
      );

      return successResponse(
        res,
        result.rows[0],
        "Cadastro realizado com successo",
        200
      );
    }
  } catch (error) {
    console.error("Error creating opinion:", error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

module.exports = {
  createOpinion,
};
