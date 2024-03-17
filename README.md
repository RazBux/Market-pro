
# Market Pro App

## Overview
Market Pro is a dynamic web application designed to automate the collection of revenue data from company reports. Built with Node.js, GraphQL, React, and SQLite, it efficiently scrapes, stores, and visualizes data through intuitive graphs, offering users a comprehensive view of financial trends and insights.

## Features

- **Data Scraping**: Automated scraping of revenue data from various company reports with Python using mainly PyPdf2 and Pandas.
- **Data Visualization**: Interactive graphs to visualize revenue trends and insights.
- **GraphQL API**: Efficient data retrieval with GraphQL, enabling fast and flexible queries.

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/market-pro.git
   cd market-pro
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

## License

Distributed under the MIT License. See `LICENSE` for more information.
