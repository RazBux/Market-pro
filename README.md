
# Market Pro App

## Overview
Market Pro is a dynamic web application designed to automate the collection of revenue data from company reports. Built with Node.js, GraphQL, React, and SQLite, it efficiently scrapes, stores, and visualizes data through intuitive graphs, offering users a comprehensive view of financial trends and insights.

## Features

- **Data Scraping**: Automated scraping of revenue data from various company reports with Python using mainly PyPdf2 and Pandas .
- **System Logs**: During the 'data_collection' process, logs will be produced to provide a clear and comprehensive understanding of the actions performed by the code. These logs will be presented in a neatly organized table format using the Tabulate library for enhanced readability. 
- **Data Visualization**: Interactive graphs to visualize revenue trends and insights.
- **GraphQL API**: Efficient data retrieval with GraphQL, enabling fast and flexible queries.

## Getting Started

### Prerequisites

- Node.js (v20.10.x or later)
- npm (v10.2.3 or later)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/RazBux/Market-pro.git
   cd Market-pro
   ```

2. **Install Dependencies**

   Navigate to the project directory and install the required dependencies.

   - For the backend:

     ```bash
     cd market-server
     npm install
     ```

   - For the frontend:

     ```bash
     cd react-front
     npm install
     ```

3. **Start the Backend Server**

   ```bash
   cd market-server
   npm start
   ```

   This command starts the GraphQL server on `http://localhost:8000/GraphQl?`.

4. **Launch the Frontend Application**

   Open a new terminal window, navigate to the frontend directory, and start the React app.

   ```bash
   cd react-front
   npm start
   ```

   This will open the application in your default web browser at `http://localhost:3000`.

## Contributing

Contributions to Market Pro are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

