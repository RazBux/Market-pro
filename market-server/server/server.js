// // const express = require('express');
// // const expressGraphQL = require('express-graphql').graphqlHTTP;
// // const schema = require('./schema/schema');
// // const bodyParser = require('body-parser');
// // const cors = require('cors'); // Import the cors middleware

// // const app = express();
// // const PORT = process.env.PORT || 8000;

// // app.use(bodyParser.json());

// // // Enable CORS for all routes
// // app.use(cors());

// // // Use graphqlHTTP middleware to handle GraphQL requests
// // app.use('/graphql', expressGraphQL({
// //     schema: schema,
// //     graphiql: true
// // }));

// // app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}`);
// // });
 
// // // module.exports = app;


// const express = require("express");
// const { graphqlHTTP } = require("express-graphql");
// const schema = require("./schema/schema");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 8000;

// /**
//  * CORS FIRST (before /graphql)
//  * allow local dev + production later
//  */
// const corsOptions = {
//   origin: [
//     "http://localhost:3000",
//     "http://127.0.0.1:3000",
//     "https://market-front.raz12386.workers.dev",
//     // add your deployed frontend later:
//     // "https://your-frontend.onrender.com",
//     // "https://your-frontend.vercel.app",
//   ],
//   methods: ["GET", "POST", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: false, // set true only if you really use cookies
// };

// // enable CORS + preflight
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // handles preflight requests

// // (body parsing) - express has built-in json
// app.use(express.json());

// // simple health check
// app.get("/", (req, res) => res.send("OK"));

// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema,
//     graphiql: true,
//   })
// );

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://market-front.raz12386.workers.dev",
    // "https://YOUR_PROJECT.pages.dev",
    // "https://YOUR_CUSTOM_DOMAIN.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.send("OK"));

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV !== "production",
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
