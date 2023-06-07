require('dotenv').config();
const {API_KEY} = process.env;          //Se trae la KEY de la API para procesar los requests
const axios = require('axios')
const{Recipe, Diets} = require('../db');
const { response } = require('express');
const Sequelize = require('sequelize')


//Controller para obtener receta por id

async function getRecipeByID(req, res){
    var id = req.params.idRecipe;
    //id = Number(id);
    const reqLink = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&addRecipeInformation=true`
    
    try{
        //Buscamos en la BD                         Verificar su el include está bien
        if(isNaN(id)){
        const response = await Recipe.findByPk(id, {include: Diets});
        const{name, image, summary, health_Score, diets, stepByStep} = response
                var dietas = diets.map(d=>d.name)
        const respuesta =  {id, name, image,summary, health_Score, diets: dietas, stepByStep}      
        if(response){
            res.status(200).json(respuesta);
        }
        }else{
            const responseAPI = await axios.get(reqLink);
            if(responseAPI){
                const data = responseAPI.data;
                //funcion para obtener el paso a paso en un formato mas simple
                const pasoApaso = function(){
                    var pasos =[]
                    var aux = data.analyzedInstructions[0];
                    if(aux){
                    aux.steps.forEach(st => {
                        pasos.push(st.number +". "+ st.step)
                    })}else{
                        pasos.push('No hay paso a paso registrado en la API')
                    };
                    return pasos;
                }
                
                const auxRecipe = {
                    id: data.id,
                    name: data.title,
                    image: data.image,
                    summary: data.summary,
                    health_Score: data.healthScore,
                    diets: data.diets,
                    stepByStep: pasoApaso()
                }
                return res.status(200).json(auxRecipe);
            }
            else{
                return res.status(404).send(`La receta con id ${id} no existe`);
            }    
        }
    }catch(err){
        return res.status(404).send(err.message);
    }
}

//controller para obtener receta por nombre

async function getRecipeByName(req, res){
    try{
        var name = req.query.name;          
        var responseDB = [];
        var recipesDB=[];
        if(name){
            responseDB = await Recipe.findAll({where: {name: {[Sequelize.Op.iLike]: `%${name}%`}},
                include: {
                    model: Diets,
                    attributes:['name'],
                    through: {
                        attributes: []
                    }
                }})
            responseDB.forEach((rec)=>{
                const{id, name, image, summary, health_Score, diets, stepByStep} = rec
                var dietas = diets.map(d=>d.name)
                recipesDB.push({id, name, image,summary, health_Score, diets: dietas, stepByStep})
            })    

            const linkRequest = `https://api.spoonacular.com/recipes/complexSearch?query=${name}&apiKey=${API_KEY}&number=100&addRecipeInformation=true`
            const responseApi = await axios.get(linkRequest)
            const recetasApi = []
                if(responseApi){
                    const data = responseApi.data;
                    const recipes = data.results;               //extraemos el array de recetas del objeto results que responde la api
                    
                    recipes.forEach((re)=>{
                        var sbs = function(){
                            var pasos =[]
                            var aux = re.analyzedInstructions[0];
                            if(aux){
                                aux.steps.forEach(st => {
                                    pasos.push(st.number +". "+ st.step)
                                });
                            }        
                            return pasos;
                        }
                        var aux = {
                            id: re.id,
                            name: re.title,
                            image: re.image,
                            summary: re.summary,
                            health_Score: re.healthScore,
                            diets: re.diets,
                            stepByStep: sbs()
                        }
                        recetasApi.push(aux);
                    })    
                }
            const allRecipes= recetasApi.concat(recipesDB);
            res.status(200).json(allRecipes)
        }
        else{
            responseDB = await Recipe.findAll({
                include: {
                    model: Diets,
                    attributes:['name'],
                    through: {
                        attributes: []
                    }
                }})
            responseDB.forEach((rec)=>{
                const{id, name, image, summary, health_Score, diets, stepByStep} = rec
                var dietas2 = diets.map(d=>d.name)
                recipesDB.push({id, name, image,summary, health_Score, diets: dietas2, stepByStep})
            })       
        
   
        name = ''              //Se le asinga este valor para poder hacer el request sin parametro

        const linkRequest = `https://api.spoonacular.com/recipes/complexSearch?query=${name}&apiKey=${API_KEY}&number=100&addRecipeInformation=true`
        const responseApi = await axios.get(linkRequest)
        const recetasApi = []
            if(responseApi){
                const data = responseApi.data;
                const recipes = data.results;               //extraemos el array de recetas del objeto results que responde la api
                
                recipes.forEach((re)=>{
                    var sbs = function(){
                        var pasos =[]
                        var aux = re.analyzedInstructions[0];
                        if(aux){
                            aux.steps.forEach(st => {
                                pasos.push(st.number +". "+ st.step)
                            });
                        }        
                        return pasos;
                    }
                    var aux = {
                        id: re.id,
                        name: re.title,
                        image: re.image,
                        summary: re.summary,
                        health_Score: re.healthScore,
                        diets: re.diets,
                        stepByStep: sbs()
                    }
                    recetasApi.push(aux);
                })    
            }
        const allRecipes= recetasApi.concat(recipesDB);
        res.status(200).json(allRecipes)
        }
    }
    catch (err){
        res.status(404).send(err.message)
    }    
}

//controller para crear receta
async function createRecipe(req,res){
    const {name, image, summary, health_Score, stepByStep, diets} = req.body;
    if(!name, !image, !summary, !health_Score, !stepByStep, !diets){
        return res.status(404).send("Faltan datos obligatorios")
    }
    try{
        const newRecipe = await Recipe.create({name, image, summary, health_Score, stepByStep})
        if(diets){
            diets.forEach(async(d)=>{
                let diet = await Diets.findAll({where: {name: d}})
                await newRecipe.addDiets(diet)
            })
        }   
        return res.status(201).json(newRecipe)
    }
    catch(err){
        return res.status(402).send(err.message)
    }
}

//controler para obtener las dietas de la API y almacenarlas en la BD

async function getDiets(req, res){
    try{
        const reqLink = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=100&addRecipeInformation=true`
        const {data} = await axios.get(reqLink);
        const arrayRecipes = data.results;
        var arrayDiets = [];
        arrayRecipes.forEach((r)=>{
            if(r.diets){
                r.diets.forEach((d)=>{
                    if(!arrayDiets.includes(d)){
                        arrayDiets.push(d);
                    }
                })
            }
        })

        arrayDiets = arrayDiets.map(d =>{return {name: d}})
        // verificamos que la BD está vacía para no duplicar.
        const listDiets = await Diets.findAll();
        if(listDiets.length ===0) await Diets.bulkCreate(arrayDiets);

        const allDiets = await Diets.findAll()
        return res.status(200).json(allDiets)

    }
    catch(err){
        res.status(404).send(err.message)
    }
}

module.exports ={
    getRecipeByID,
    getRecipeByName,
    createRecipe,
    getDiets
}