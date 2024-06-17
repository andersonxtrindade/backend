const db = require("../config/database");
const { successResponse, errorResponse } = require("../utils/responseHandler");


const getConversationUsers = async (req, res) => {
  try {
    const userId = req.query.userId;

    const query = `
      SELECT DISTINCT
        CASE
          WHEN me.id_remete = $1 THEN me.id_destinatario
          WHEN me.id_destinatario = $1 THEN me.id_remete
        END AS id_usuario,
        us.nome
      FROM projetolivros.mensagemprivada AS me
      LEFT JOIN projetolivros.usuario AS us ON (
        us.id_usuario = CASE
          WHEN me.id_remete = $1 THEN me.id_destinatario
          WHEN me.id_destinatario = $1 THEN me.id_remete
        END
      )
      WHERE me.id_remete = $1 OR me.id_destinatario = $1;
    `;

    const { rows } = await db.query(query, [userId]);
    return successResponse(res, rows, 'Usuários com conversa recuperados com sucesso', 200);
  } catch (error) {
    console.error('Erro ao recuperar usuários com conversa:', error);
    return errorResponse(res, error.message, 'Erro interno do servidor', 500);
  }
};

const getConversation = (req, res) => {
  const userId = req.query.userId;
  const otherUserId = req.query.otherUserId;

  const query = `
    SELECT me.id_mensagem, me.conteudo, me.data, id_remete, id_destinatario, ur.nome as remetente, ud.nome as destinatario
    FROM projetolivros.mensagemprivada as me
    LEFT JOIN projetolivros.usuario as ur ON (ur.id_usuario = me.id_remete)
    LEFT JOIN projetolivros.usuario as ud ON (ud.id_usuario = me.id_destinatario)
      WHERE (id_remete = ${userId} AND id_destinatario = ${otherUserId})
        OR (id_remete = ${otherUserId} AND id_destinatario = ${userId})
      ORDER BY data
  `;

  db.query(query, (error, results) => {
    if (error) {
      return errorResponse(res, error.message, "Internal Server Error", 500);
    }

    return successResponse(res, results.rows, 'Consulta realizada com successo', 200);
  });
};

const sendMessage = async (req, res) => {
  const { id_remete, id_destinatario, conteudo } = req.body;

  console.log(id_remete, id_destinatario, conteudo)

  try {
    const result = await db.query(`
      INSERT INTO projetolivros.mensagemprivada (id_remete, id_destinatario, conteudo, data)
      VALUES ($1, $2, $3, NOW()) RETURNING *
    `, [id_remete, id_destinatario, conteudo]);

    return successResponse(
      res,
      result.rows[0],
      "Mensagem realizada com sucesso",
      200
    );
  } catch (error) {
    console.error('Erro ao executar consulta:', error);
    return errorResponse(res, error.message, "Internal Server Error", 500);
  }
};

module.exports = {
  getConversationUsers,
  getConversation,
  sendMessage
};
