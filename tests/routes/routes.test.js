const request = require("supertest");
const express = require('express');
const  server  = require('../../src/app')
const router = require('../../src/routes/index');



server.use(router);
const api = request(server)


describe('Test de rutas',()=>{
    it('Crear receta ', async () =>{
        const recipeTest = {
            name: "receta.name",
            image: "receta.image",
            summary: "receta.summary",
            health_Score: 11,
            stepByStep: ["paso 1", "paso 2"],
            diets: ["ketogenic"]
        }
        const respuesta = await api.post("/recipes").send(recipeTest)
        expect(respuesta.status).toBeGreaterThanOrEqual(200);
        expect(respuesta.status).toBeLessThan(300);
    })

    it('Get dietas', async() =>{
        const respuesta = await api.get('/diets')
        if(respuesta.body.length > 0){
            expect(respuesta.status).toBeGreaterThanOrEqual(200);
            expect(respuesta.status).toBeLessThan(300);
        }
    })
    it('get Recipe por id', async()=>{
        const respuesta = await api.get('/recipes/1')
        expect(respuesta.body.name).toEqual("Fried Anchovies with Sage")
    })
})

