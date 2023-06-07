const { DataTypes } = require('sequelize');
const sequelize = require('sequelize');
const {v4: uuidv4} = require ('uuid');

// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
    sequelize.define('diets', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: ()=>uuidv4()
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          }
    },{timestamps: false})
}