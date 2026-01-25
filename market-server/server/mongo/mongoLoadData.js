// const sqlite3 = require('sqlite3').verbose();
// const mongoose = require('mongoose');

// // Connect to MongoDB Atlas
// mongoose.connect('mongodb+srv://raz12386:ywY3huplY2RCbE41@cluster0.idzautj.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
// const mongoDB = mongoose.connection;

// mongoDB.on('error', console.error.bind(console, 'MongoDB connection error:'));
// mongoDB.once('open', () => {
//     console.log('Connected to MongoDB Atlas');

//     // Access SQLite database
//     const sqliteDB = new sqlite3.Database('/Users/razbuxboim/Desktop/pyPro/docs/db/TSLA.db');

//     // Specify SQLite table name
//     const tableName = 'tesla';

//     // Fetch all rows from SQLite table
//     sqliteDB.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
//         if (err) {
//             console.error(err.message);
//             return;
//         }

//         // Define a generic schema with key-value pairs
//         const genericSchema = new mongoose.Schema({}, { strict: false });
//         const GenericModel = mongoose.model('GenericModel', genericSchema);

//         // Map SQLite rows to MongoDB documents
//         const mongoDocuments = rows.map(rowData => rowData);

//         try {
//             // Insert all documents into MongoDB in one shot
//             await GenericModel.insertMany(mongoDocuments);
//             console.log('Data migrated to MongoDB');
//         } catch (error) {
//             console.error(error);
//         } finally {
//             // Close SQLite database connection
//             sqliteDB.close();
//             // Close MongoDB connection
//             mongoose.connection.close();
//         }
//     });
// });
