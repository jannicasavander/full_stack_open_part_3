require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/people");

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());

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

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findById(id)
        .then(person => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end();
        })
        .catch(error => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.post("/api/persons", (request, response, next) => {
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

            newPerson
                .save()
                .then(savedPerson => {
                    response.json(savedPerson);
                })
                .catch(error => next(error));
        })
        .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message });
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
