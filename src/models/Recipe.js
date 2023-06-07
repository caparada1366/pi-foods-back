const { DataTypes } = require('sequelize');
const {v4: uuidv4} = require ('uuid');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('recipe', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: ()=>uuidv4()
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    health_Score:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stepByStep:{
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    }
    },
    {
      timeStamps: false
  }
  );
};
