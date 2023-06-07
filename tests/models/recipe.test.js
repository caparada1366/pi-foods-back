const {Recipe, Diets, sequelize} = require('../../src/db.js');

describe('Test para Recipes', ()=>{
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  describe('Mi Recetea',() =>{
    test('Debe tener las propiedades correctas', async () => { 
      const receta = await Recipe.build({
        id: "ab12",
        name: "Pollo",
        image: "hola.jpg",
        summary:  "Resumen",
        health_Score: 10,
        stepByStep: ["paso 1", "paso 2"]
      })
      const keys = ['id', 'name', 'image', 'summary', 'health_Score', 'stepByStep'];
      expect(Object.keys(receta.toJSON())).toEqual(keys)
     })
  
     test("La propiedad name no puede ser null", async () => {
      expect.assertions(1);
      try {
        await Recipe.create({
          id: "ab12",
          image: "hola.jpg",
          summary:  "Resumen",
          health_Score: 10,
          stepByStep: ["paso 1", "paso 2"]
        });
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });

    test("La propiedad health_Score no puede ser texto", async () => {
      expect.assertions(1);
      try {
        await Recipe.create({
          id: "ab12",
          image: "hola.jpg",
          summary:  "Resumen",
          health_Score: "hola",
          stepByStep: ["paso 1", "paso 2"]
        });
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  
    test('No debe contener los timestamps automáticos', async () => { 
      const receta = await Recipe.build({
        id: "ab12",
        name: "Pollo",
        image: "hola.jpg",
        summary:  "Resumen",
        health_Score: 10,
        stepByStep: ["paso 1", "paso 2"]
      })
      const timestamps = ['createdAt', 'updatedAt'];
      expect(Object.keys(receta.toJSON())).not.toEqual(expect.arrayContaining(timestamps));
     })
  })  
});

