const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());

function verifyJwtToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'user unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Access Denied' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
    // console.log('from verify jwt token function', authHeader);

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bk9fn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('primefactor').collection('inventory');
        const myItemsCollection = client.db('primefactor').collection('myItems');

        // get all inventory item
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray();
            res.send(inventories);
        });
        // get single inventory item
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });
        // post single inventory item
        app.post('/inventory', async (req, res) => {
            const newItem = req.body;
            const output = await inventoryCollection.insertOne(newItem);
            res.send(output);
        });
        // delete inventory item 
        app.delete('/inventory/:id', async (req, res) => {
            const inventoryId = req.params.id;
            const query = { _id: ObjectId(inventoryId) };
            const output = await inventoryCollection.deleteOne(query);
            res.send(output)
        });

        // put for update quantity of item
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updateQty = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateQty.quantity
                }
            };
            const output = await inventoryCollection.updateOne(filter, updatedDoc, options);
            res.send(output);
        });

        // myitem post
        app.post("/myitem", async (req, res) => {
            const myitem = req.body;
            if (!myitem.name || !myitem.img) {
                return res.send({
                    succsess: false,
                    error: "Plase provide all information",
                });
            }
            const output = await myItemsCollection.insertOne(myitem);
            res.send(output);
        });

        // myitem get 
        app.get('/myitem', verifyJwtToken, async (req, res) => {
            const decodeEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodeEmail) {
                const query = { email: email };
                const cursor = myItemsCollection.find(query);
                const myItem = await cursor.toArray();
                res.send(myItem);
            }
            else {
                res.status(403).send({ message: 'You still have not Access!' });
            }
        });

        // for auth jwt token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '30d'
            });
            res.send({ accessToken });
        });

        // delete myitem page items
        app.delete('/myitem/:id', async (req, res) => {
            const inventoryId = req.params.id;
            const query = { _id: ObjectId(inventoryId) };
            const output = await myItemsCollection.deleteOne(query);
            res.send(output)
        });
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running primefactor warehouse system')
});

app.get('/hello', (req, res) => {
    res.send('Hello Hello')
});

app.listen(port, () => {
    console.log('listening port', port);
})