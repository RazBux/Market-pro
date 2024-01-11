const mongoose = require('mongoose');

// Define a generic schema with a single field named "data"
const genericSchema = new mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
  });
  
mongoose.connect('mongodb+srv://raz12386:ywY3huplY2RCbE41@cluster0.idzautj.mongodb.net/?retryWrites=true&w=majority');

const GenericModel = mongoose.model('GenericModel', genericSchema);


const fetchData = async () => {
    try {
      const result = await GenericModel.find({}, { quarter: 1, total_revenues: 1, _id: 0 });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
    finally{
        mongoose.connection.close();
    }
  };

fetchData();



// // Find all documents in the collection using promises or async/await
// GenericModel.find({})
//   .then(documents => {
//     console.log('All Documents:', documents);
//   })
//   .catch(err => {
//     console.error(err);
//   })
//   .finally(() => {
//     // Close the MongoDB connection
//     mongoose.connection.close();
//   });

// const result = await GenericModel.find({}, { quarter: 1, total_revenues: 1, _id: 0 });

// console.log(result);