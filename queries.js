const { MongoClient, ObjectID } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'hatshop';
const collectionName = 'hats';

console.log('About to connect to database...');


function runQuery(queryFunction) {
    // Anslut till MongoDB
    MongoClient.connect(
        url,
        { useUnifiedTopology: true },
        (error, client) => {
            // Kontrollera om anslutningen lyckats eller misslyckats
            if( error ) {
                console.log('Could not connect to database: ' + error.message);
                return;
                // Om man gör detta i en Express route, behöver man skicka ett lämpligt felmeddelande till frontend
            }

            // Ta fram den collection som query ska köras i
            const col = client.db(dbName).collection(collectionName);

            queryFunction(
                col,
                () => client.close()
            )
        }// connect callback
    )//connect
}//runQuery

const exampleFind = (col, whenDone) => {
    col.find({ color: 'black' }).toArray((error, docs) => {
        try {
            if( error ) {
                console.log('Bad find query!', error.message);
                return;
            }
            console.log('Found documents:');
            docs.forEach(doc => {
                console.log(`* ${doc.name}, ${doc.color}, ${doc.price} kr`);
            })
        } finally {
            whenDone();
        }
    })
}

const exampleDelete = (col, whenDone) => {
    // if( color === 'red' && color === 'green' )  <- does not work
    // if( color === 'red' || color === 'green' )  <- works
    // if _id === ObjectId("5f4507bb4d09a43064bb84f9") ||
    //     _id === ObjectId("5f45063a21f2ce5810586e7c")
    const filter = {
        $or: [
            { _id: ObjectID("5f4507bb4d09a43064bb84f9") },
            { _id: ObjectID("5f45063a21f2ce5810586e7c") }
        ]
    }
    col.deleteMany(filter, (error, result) => {
        try {
            if( error ) {
                console.log('Error when deleting: ' + error.message);
                return;
            }
            console.log(`Deleted ${result.deletedCount} documents.`);
        } finally {
            whenDone();
        }
    })
}

runQuery(exampleDelete)


// Funktionerna nedan är exempel på CRUD-funktionalitet
// men ÄR INTE ANPASSADE FÖR RUNQUERY
// Skriv gärna om dem själv!

function findHats(col, callback) {
    col.find({}).toArray((error, docs) => {
        try {
            if( error ) {
                console.log('Bad find query!', error.message);
                return;
            }
            console.log('Found documents:');
            docs.forEach(doc => {
                console.log('* ' + doc.name);
            })
        } finally {
            callback();
        }
    })
}


function insertHats(col, callback) {
    col.insertMany(
        [
            { name: 'beret', price: 20, color: 'black' },
            { name: 'fedora', price: 400, color: 'blond' }
        ],
        (error, result) => {
            try {
                if( error ) {
                    console.log('Bad insert query!', error.message);
                    return;
                }
                console.log('Query successful, added hats.');
                console.log(result);
            } finally {
                // client.close();
                callback();
            }
        }
    )
}


function updateHat(col, client) {
    // const filter = { _id: new ObjectID("5d62f9ac559322bc151c056c") };
    const filter = { name: 'cap' };
    const update = { $inc: { price: 5 } };
    col.updateOne(filter, update, (error, result) => {
        if( error ) {
            console.log('Could not update hat', error.message);
        } else {
            console.log('Hat updated', result.result);
        }
        client.close();
    })
}


function deleteHat(col, client) {
    const filter = { _id: new ObjectID("5f4507bb4d09a43064bb84fa")}
    col.deleteOne(filter, (error, result) => {
        if( error ) {
            console.log('Could not remove hat', error.message);
        } else {
            console.log('Removed hat', result.result);
        }
        client.close();
    })
}
