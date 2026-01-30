import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Usuario from "./Usuario.js";

const Arquivo = sequelize.define("Arquivo", {
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo_documento: {
    type: DataTypes.ENUM(
      'CPF',
      'RG/CIN',
      'Comprovante Escolar-Histórico', 
      'Certidão de Nascimento',        
      'Comprovante de Residência'      
    ),
    allowNull: false
  },
  nome_original: { type: DataTypes.STRING, allowNull: false },
  nome_armazenado: { type: DataTypes.STRING, allowNull: false },
  caminho_arquivo: { type: DataTypes.STRING, allowNull: false },
  tamanho: { type: DataTypes.INTEGER, allowNull: false },
  data_upload: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// Relacionamentos
Arquivo.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Arquivo, { foreignKey: "usuario_id" });

export default Arquivo;
