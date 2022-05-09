const express = require('express');
const cors = require('cors');

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8xa8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("assignment-11").collection("services");
        console.log('db connected ')

//AUTH
app.post('/login', async (req, res) => {
    const user = req.body;
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
    });
    res.send({ accessToken });
})

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
         //ADD ITEM API
         app.post('/add', async (req, res) => {
            const newItem = req.body;
            const result = await servicesCollection.insertOne(newItem);
            res.send(result);
        });

          //JWT API
          app.get('/add', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = servicesCollection.find(query);
                const addItems = await cursor.toArray();
                res.send(addItems)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

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