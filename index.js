const express = require("express");
var morgan = require("morgan");
const app = express();

app.use(express.json());
app.use(express.static('dist'))
app.use(morgan("tiny"));
app.use(morgan(":newPerson"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

let latestPerson = null;

morgan.token("newPerson", (req, res) => {
  if (!latestPerson) return ''
  const {id, ...person} = latestPerson
  return JSON.stringify(person)
});

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const randomId = Math.floor(Math.random() * 100000000);
  return randomId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const nameExists = persons.some((p) => p.name === body.name);
  const numberExists = persons.some((p) => p.number === body.number);

  if (nameExists || numberExists) {
    return response.status(400).json({
      error: "name or number already exists.",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  latestPerson = person;

  response.json(person);
});

app.get("/info", (request, response) => {
  const totalPeople = persons.length;
  const currentDate = new Date(8.64e15).toString();
  response.send(`
  <p>Phonebook has info for ${totalPeople} people</p>
  <p>${currentDate}</p>
`);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
