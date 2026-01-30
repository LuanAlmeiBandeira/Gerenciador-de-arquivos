import nc from "next-connect";
import Arquivo from "../../../models/Arquivo.js";

const handler = nc();

// UPDATE: Alterar o tipo do documento
handler.put(async (req, res) => {
  const { id } = req.query;
  const { tipo_documento } = req.body;

  try {
    const arquivo = await Arquivo.findByPk(id);
    if (!arquivo) return res.status(404).json({ error: "Arquivo não encontrado" });

    arquivo.tipo_documento = tipo_documento;
    await arquivo.save();

    res.json(arquivo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE
handler.delete(async (req, res) => {
  const { id } = req.query;
  try {
    const arquivo = await Arquivo.findByPk(id);
    if (!arquivo) return res.status(404).json({ error: "Arquivo não encontrado" });
    await arquivo.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default handler;