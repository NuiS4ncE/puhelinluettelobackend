require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 4
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]
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
    res.send(`Phonebook has info for ${persons.length} people <br> <br> ${date}`)
})


app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons.map(person => person.toJSON()))
    }).catch(error => {
        console.log(error);
        response.status(404).end()
    })
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person.toJSON())
    }).catch(error => {
        console.log(error);
        response.status(404).end()
    })
})

app.post('/api/persons', (req, res) => {
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
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end()
    })
    .catch(error => next(error))
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 