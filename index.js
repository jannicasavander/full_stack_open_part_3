require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/people");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
    return JSON.stringify(req.body);
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :body",
    ),
);

app.get("/api/persons", (request, response) => {
    Person.find({}).then(people => {
        response.json(people);
    });
});

app.get("/info", (request, response) => {
    Person.countDocuments({}).then(count => {
        let html_response = `<p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>`;
        response.send(html_response);
    });
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => {
            console.log(error);
            response.status(500).end();
        });
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
});

const generateId = () => {
    return Math.floor(Math.random() * 1000000);
};

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.number || !body.name) {
        return response.status(400).json({
            error: "name or number missing",
        });
    }

    Person.findOne({ name: body.name })
        .then(person => {
            if (person) {
                return response.status(400).json({
                    error: "name must be unique",
                });
            }
            const newPerson = new Person({
                name: body.name,
                number: body.number,
            });

            newPerson.save().then(savedPerson => {
                response.json(savedPerson);
            });
        })
        .catch(error => {
            console.log(error);
            response.status(500).end();
        });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
