const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'hatshop';
const collectionName = 'hats';

console.log('About to connect to database...');

MongoClient.connect(url, { useUnifiedTopology: true }, (error, client) => {
    if( error ) {
        console.log('Could not connect!', error.message);
        return;
    }
    console.log('Connected to database');

    const db = client.db(dbName);
    const col = db.collection(collectionName);
    insertHats(col, () => {
        findHats(col, () => client.close())
    });
})
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
