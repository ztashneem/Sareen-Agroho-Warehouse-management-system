const express = require('express');
const cors = require('cors');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8xa8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("assignment-11").collection("services");
        console.log('db connected ')

        //SERVICES API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find()
            const services = await cursor.toArray();
            res.send(services);
        });
         //SINGLE SERVICE API
         app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.findOne(query);
            res.send(result);
        });

         //QUANTITY UPDATE API 
         app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: user.newQuantity
                },
            };
            result = await servicesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //QUANTITY DELIVERY API
        app.put('/delivery/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const deliver = user.quantity - 1;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: deliver
                },
            };
            result = await servicesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        
        //ITEM DELETE API
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server Check')
})
app.listen(port, () => {
    console.log('Listening Port', port);
})