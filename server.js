require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const POKEDEX = require('./pokedex.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
 
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

function handleGetTypes(req, res) {
    let type = req.query.type
    let results = POKEDEX.pokemon;

    if(type) {
        if (![`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`].includes(type)){
            return res
            .status(400)
            .send('Please enter a valid type')
        }
    }

    if(type) {
        results = POKEDEX.pokemon.filter(p => 
            p.type.includes(type))
    }

    res.json(results)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    let results = POKEDEX.pokemon

    if(req.query.search){
        results = results
            .filter(p => 
                p
                    .name
                    .toLowerCase()
                    .includes(req.query.search.toLowerCase()));
    }

    if(req.query.type){
        results = results
            .filter(p => 
            p.type.includes(req.query.type)
        )
    }
    
    res.json(results)  
}

app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production') {
        response = { error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})