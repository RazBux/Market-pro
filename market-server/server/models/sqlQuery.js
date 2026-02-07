const sqlite3 = require('sqlite3').verbose(); // Import the sqlite3 package
const db = new sqlite3.Database('./docs/income_statements.sqlite'); // 

//retrieve all the column from the specific table.
function getTableColumns({ tableName }) {
  return new Promise((resolve, reject) => {
    const query = `PRAGMA table_info(${tableName});`;

    db.all(query, (err, rows) => {
      if (err) {
        console.error(`Error getting columns for ${tableName}:`, err);
        reject(err);
      } else {
        const columns = rows.map(row => row.name);
        console.log(`${tableName} columns:`, JSON.stringify(columns, null, 2));
        resolve(columns);
      }
    });
  });
}

// get all table and their columns from a db.
function getAllTableAndThierColumns() {
  return new Promise((resolve, reject) => {
    const query = "SELECT name FROM sqlite_master WHERE type='table';";

    db.all(query, async (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err);
        reject(err);
        return;
      }

      const tableColumnsPromises = tables.map(table => getTableColumns({ tableName: table.name }));
      const tableColumns = await Promise.all(tableColumnsPromises);

      const result = {};
      tables.forEach((table, index) => {
        result[table.name] = tableColumns[index];
      });
      resolve(result);
    });
  });
}


//get all the table name (only) from a db. 
function getAllTableNames() {
  return new Promise((resolve, reject) => {
    const query = "SELECT name FROM sqlite_master WHERE type='table';";

    db.all(query, (err, tables) => {
      if (err) {
        console.error('Error getting table names:', err);
        reject(err);
        return;
      }
      const tableNames = tables.map(table => table.name);
      console.log(`Table names: ${tableNames.join(', ')}`);
      resolve(tableNames);
    });
  });
}


// ✅ IMPROVED: Better error handling and logging
function getDataByQuery(sqlQuery) {
  console.log(`📊 Executing SQL query: ${sqlQuery}`);
  
  return new Promise((resolve, reject) => {
    db.all(sqlQuery, (err, rows) => {
      if (err) {
        console.error('❌ SQL Query Error:', err.message);
        console.error('Query was:', sqlQuery);
        reject(err);
        return;
      }
      
      const data = rows.map(row => ({ ...row }));
      console.log(`✅ Query returned ${data.length} rows`);
      
      // Only log first row to avoid console spam
      if (data.length > 0) {
        console.log('First row sample:', data[0]);
      }

      resolve(data);
    });
  });
}

// ✅ IMPROVED: Added limit support
function create_sql_query({ tableName, columnList, limit }) {
  // Ensure columnList is an array
  var columns;
  if (columnList) {
    columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
  } else {
    columns = "*";
  }
  
  // Create the SQL query string
  let query = `SELECT ${columns} FROM ${tableName}`;
  
  // ✅ NEW: Add LIMIT if provided
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  query += ';';

  return getDataByQuery(query);
}


module.exports = {
  getTableColumns,
  getAllTableAndThierColumns,
  getAllTableNames,
  getDataByQuery,
  create_sql_query
};


/* ===== TESTING EXAMPLES =====

// Test getting all table names
getAllTableNames()
  .then(tableNames => {
    console.log('Table names:', tableNames);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Test getting columns
getTableColumns({ tableName: 'income_statement_AAPL_quarterly' })
  .then(columns => {
    console.log('Columns:', columns);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Test creating and executing a query
create_sql_query({ 
  tableName: 'income_statement_AAPL_quarterly',
  columnList: ['fiscalDateEnding', 'totalRevenue', 'netIncome'],
  limit: '5'
})
  .then(data => {
    console.log('Data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

*/