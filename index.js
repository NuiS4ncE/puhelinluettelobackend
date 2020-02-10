require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
var logger = morgan('body')
app.use(logger)

const date = new Date()


app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

morgan.token('body', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'))

app.use(cors())

app.get('/info', (req, res) => {
    const num = 0
    Person.find({}).then(persons => {
        num = persons.length
    })
    res.send(`Phonebook has info for ${num} people <br> <br> ${date}`)
})


app.get('/api/persons', (req, res) => {
    const body = req.body
    /*if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }*/
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    }).catch(error => {
        console.log(error);
        response.status(404).end()
    })
})


app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (!body.number || !body.name) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        res.json(savedPerson.toJSON())
    })
        .catch(error => next(error))
})

//if (Person.exists({ name: body.name })) {
app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})
//}

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res - status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 