require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
var morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))
app.use(morgan(':newPerson'))

let latestPerson = null

const errorHandler = (error, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

morgan.token('newPerson', () => {
  if (!latestPerson) return ''
  const { ...person } = latestPerson
  return JSON.stringify(person)
})

app.get('/', (response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (response) => {
  Person.find({}).then((person) => {
    response.json(person)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * 100000000)
  return randomId
}

app.put('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      person.number = request.body.number
      response.status(204)
      return person
    })
    .then((res) => response.json(res))
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((res) => {
      response.json(res)
    })
    .catch((error) => next(error))
})

app.get('/info', (response) => {
  Person.find({}).then((total) => {
    const totalPeople = total.length
    const currentDate = new Date(8.64e15).toString()
    response.send(`
    <p>The phonebook has info for ${totalPeople} people</p>
    <p>${currentDate}</p>`)
  })
})

const unknownEndpoint = (response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
