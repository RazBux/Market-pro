const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8000;

// ✅ UPDATED: Added localhost:3000 for your React app
const corsOptions = {
  origin: [
    "http://localhost:3000",           // ✅ Your React app (development)
    "http://127.0.0.1:3000",          // ✅ Alternative localhost
    "http://localhost:3001",           // ✅ In case React runs on 3001
    "https://market-front.raz12386.workers.dev", // Your production frontend
    // Add more as needed:
    // "https://YOUR_PROJECT.pages.dev",
    // "https://YOUR_CUSTOM_DOMAIN.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // Set to true if you need cookies/auth
};

// Enable CORS for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "GraphQL server is running",
    endpoints: {
      graphql: "/graphql",
      graphiql: "/graphql (open in browser)"
    }
  });
});

// ✅ UPDATED: Always enable GraphiQL for development
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // ✅ CHANGED: Always enabled for development (set to false in production)
    // ✅ ADDED: Better error reporting
    customFormatErrorFn: (error) => ({
      message: error.message,
      locations: error.locations,
      path: error.path,
    })
  })
);

// ✅ ADDED: Better startup logging
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 GraphQL Server is running!');
  console.log('='.repeat(60));
  console.log(`📍 Server URL:        http://localhost:${PORT}`);
  console.log(`🔍 GraphiQL UI:       http://localhost:${PORT}/graphql`);
  console.log(`💻 Environment:       ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('✅ CORS enabled for:');
  corsOptions.origin.forEach(origin => console.log(`   - ${origin}`));
  console.log('='.repeat(60));
});

// ✅ ADDED: Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;