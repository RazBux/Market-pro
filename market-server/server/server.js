const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP;
const schema = require('./schema/schema');
const { graphqlHTTP } = require('express-graphql'); // Use graphqlHTTP for middleware
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
// import cors from 'cors';

const app = express();
const PORT = 8000;

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Use graphqlHTTP middleware to handle GraphQL requests
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
 
// module.exports = app;
