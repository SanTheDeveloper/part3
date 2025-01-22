const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// Custom token to log request body for POST requests
morgan.token("post-data", (request) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
  return "-";
});

// Use morgan with a custom format
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data"
  )
);

app.use(cors()); // Enable CORS for all routes

app.use(express.json()); //Enable JSON parsing

// Hardcoded phonebook data
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

// Route to get all phonebook entries
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

app.get("/info", (request, response) => {
  const currentTime = new Date().toString();
  const numberOfEntries = persons.length;

  response.send(`
    <p>Phonebook has info for ${numberOfEntries} people</p>
    <p>${currentTime}</p>
    `);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;
  return String(maxId + 1);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({ error: "name is missing" });
  } else if (!body.number) {
    return response.status(400).json({ error: "number is missing" });
  }

  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  response.json(newPerson);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
