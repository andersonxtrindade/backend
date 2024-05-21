const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// Controlador para criar um novo troca
const createTrade = async (req, res) => {
  const {
    status_troca,
    id_remete,
    id_destinatario,
    id_livroremetente,
    id_livrodestinatario,
    conteudo,
  } = req.body;
  try {
    const select = await db.query(
      "SELECT * FROM projetolivros.livro WHERE id_livro = $1 and id_usuario = $2;",
      [id_livrodestinatario, id_remete]
    );
    if (select.rows.length === 1) {
      return errorResponse(
        res,
        "Falha no cadastro!",
        "Você é o dono desse livro, não pode solicitar uma troca.",
        401
      );
    } else {
      const result = await db.query(
        "INSERT INTO projetolivros.troca(data, status, id_remete, id_destinatario, id_livroremetente, id_livrodestinatario, conteudo) VALUES (now(), $1, $2, $3, $4, $5, $6) RETURNING *;",
        [
          status_troca,
          id_remete,
          id_destinatario,
          id_livroremetente,
          id_livrodestinatario,
          conteudo,
        ]
      );

      return successResponse(
        res,
        result.rows[0],
        "Cadastro realizado com successo",
        200
      );
    }
  } catch (error) {
    console.error("Error creating trade:", error);
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
  createTrade,
  updateTrade,
};
