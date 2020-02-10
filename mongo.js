const mongoose = require('mongoose')

if ( process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}



const password = process.argv[2]

const url = 
`mongodb+srv://hallitsija:${password}@cluster0-bamq2.mongodb.net/person-app?retryWrites=true`
console.log(url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {})

const personSchema = new mongoose.Schema({
    name: String, 
    number: String
})

const Person = mongoose.model('Person', personSchema)

if ( process.argv.length < 4){
    console.log('give name and/or number')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`phonebook: \n${person.name} ${person.number}`)
            mongoose.connection.close()
            process.exit(1)
        })
    })
}

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})

person.save().then(response => {
    console.log('person saved!')
    mongoose.connection.close()
})

