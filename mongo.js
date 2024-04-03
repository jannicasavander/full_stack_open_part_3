const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://jannicasavander:${password}@fullstack-jannica.y3h15he.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=fullstack-jannica`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const name = process.argv[3];
const number = process.argv[4];

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (name !== undefined && number !== undefined) {
    const person = new Person({
        name: name,
        number: number,
    });

    person.save().then(() => {
        console.log(`added ${name} number ${number} to phonebook`);
        mongoose.connection.close();
    });
} else {
    Person.find({}).then(result => {
        console.log("phonebook:");
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
    });
}
