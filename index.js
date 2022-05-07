const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bk9fn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('primefactor').collection('inventory');

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

    }
    finally {

    }
}
run().catch(console.dir);


// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     console.log("Alhamdulillah, connencted");
//     // perform actions on the collection object
//     client.close();
// });



app.get('/', (req, res) => {
    res.send('running')
});

app.listen(port, () => {
    console.log('listening port', port);
})