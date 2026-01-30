import nc from "next-connect";
import multer from "multer";
import Usuario from "../../../models/Usuario.js";
import Arquivo from "../../../models/Arquivo.js";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      // 1. Corrigir o encoding do nome original (UTF-8)
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      
      // 2. Pegar o CPF e Tipo que o frontend enviou
      const cpf = req.body.cpf || 'sem-cpf';
      const tipo = (req.body.tipo_documento || 'doc').replace(/\//g, '-');

      // 3. Criar um nome limpo: cpf-tipo-timestamp.pdf
      const extension = originalName.split('.').pop();
      const novoNome = `${cpf}-${tipo}-${Date.now()}.${extension}`;
      
      cb(null, novoNome);
    },
  }),
});

// Suporte híbrido para versões do next-connect
const apiRoute = nc({
  onError: (err, req, res) => {
    res.status(500).json({ error: `Erro no servidor: ${err.message}` });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  const { cpf, tipo_documento } = req.body;
  
  if (!req.file) return res.status(400).json({ error: "Arquivo não enviado" });

  try {
    let [usuario] = await Usuario.findOrCreate({ 
      where: { cpf },
      defaults: { nome: "Usuário Novo", email: `${cpf}@sistema.com`, senha: "123" } 
    });

    const arquivo = await Arquivo.create({
      usuario_id: usuario.id,
      tipo_documento: tipo_documento,
      nome_original: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      nome_armazenado: req.file.filename, 
      caminho_arquivo: `/uploads/${req.file.filename}`, 
      tamanho: req.file.size,
      data_upload: new Date(),
    });

    res.status(201).json(arquivo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

apiRoute.get(async (req, res) => {
  const { cpf } = req.query;
  try {
    const usuario = await Usuario.findOne({ where: { cpf } });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    const arquivos = await Arquivo.findAll({ where: { usuario_id: usuario.id } });
    res.json({ usuario, arquivos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default apiRoute;

export const config = {
  api: { bodyParser: false },
};