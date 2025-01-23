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

// Use morgan with a custom format to log HTTP requests
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data"
  )
);

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON parsing for incoming requests
app.use(express.static("dist")); // Serve static files from the "dist" directory

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
  {
    id: "5",
    name: "Rary Takashi",
    number: "91-27-7622122",
  },
];

// Route to get all phonebook entries
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

// Route to fetch a specific phonebook entry by its ID
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end(); // Return 404 if person is not found
  }
});

// Route to display phonebook info (number of entries and current time)
app.get("/info", (request, response) => {
  const currentTime = new Date().toString();
  const numberOfEntries = persons.length;

  response.send(`
    <p>Phonebook has info for ${numberOfEntries} people</p>
    <p>${currentTime}</p>
    `);
});

// Route to delete a phonebook entry by its ID
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id); // Remove the person with the given ID
  response.status(204).end(); // Return 204 (No Content) after successful deletion
});

// Helper function to generate a new ID for a phonebook entry
const generateId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;
  return String(maxId + 1);
};

// Route to add a new phonebook entry
app.post("/api/persons", (request, response) => {
  const body = request.body;

  // Validate the request body
  if (!body.name) {
    return response.status(400).json({ error: "name is missing" });
  } else if (!body.number) {
    return response.status(400).json({ error: "number is missing" });
  }

  // Check if the name already exists in the phonebook
  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({ error: "name must be unique" });
  }

  // Create a new person object
  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);

  // Return the newly created person as JSON
  response.json(newPerson);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
