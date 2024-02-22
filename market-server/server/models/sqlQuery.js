const sqlite3 = require('sqlite3').verbose(); // Import the sqlite3 package
// const db = new sqlite3.Database('../market-server/docs/market-pro.db');
const db = new sqlite3.Database('./docs/market-pro.db');

//retrive all the column from the specific table.
function getTableColumns({ tableName }) {
  return new Promise((resolve, reject) => {
    const query = `PRAGMA table_info(${tableName});`;

    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {


        const columns = rows.map(row => row.name);
        console.log(`${tableName} columns:`, JSON.stringify(columns, null, 2));
        resolve(columns);
      }
    });
  });
}

// get all table and thier columns from a db.
function getAllTableAndThierColumns() {
  return new Promise((resolve, reject) => {
    const query = "SELECT name FROM sqlite_master WHERE type='table';";

    db.all(query, async (err, tables) => {
      if (err) {
        reject(err);
        return;
      }

      const tableColumnsPromises = tables.map(table => getTableColumns(table.name));
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
        reject(err);
        return;
      }
      const tableNames = tables.map(table => table.name);
      console.log(`table names: \n${tableNames}`)
      resolve(tableNames);
    });
  });
}


function getDataByQuery(sqlQuery) {

  console.log(`sql query: ${sqlQuery}`);
  // Execute the query using async/await
  return new Promise((resolve, reject) => {
    db.all(sqlQuery, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const data = rows.map(row => ({ ...row }));
      // console.log(`Run query: ${sqlQuery}`);
      // console.log(rows);
      console.log(`resolve data:`);
      console.log(data);

      resolve(data);
    });
  });
}

function create_sql_query({ tableName, columnList }) {
  // Ensure columnList is an array
  // console.log(Array.isArray(columnList));

  var columns;
  if (columnList) {
    columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
  }
  else {
    columns = "*";
  }
  // console.log(`column: ${columns}`);
  // Create the SQL query string
  const query = `SELECT ${columns} FROM ${tableName};`;

  return getDataByQuery(query);
}


module.exports = {
  getTableColumns,
  getAllTableAndThierColumns,
  getAllTableNames,
  getDataByQuery,
  create_sql_query
};



// ----to run all the query
// Example usage
// getAllTableColumns()
//     .then(columnsByTable => {
//         console.log('Columns by table:', columnsByTable);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// getAllTableNames()
//     .then(tableNames => {
//         console.log('Table names:', tableNames);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// var q = "SELECT quarter, total_revenues FROM tesla;"
// let e = getDataByQuery(q);
// console.log(e);
// const sqlQuery = "SELECT quarter, total_revenues FROM tesla";
// getDataByQuery(sqlQuery)
//     .then(tableNames => {
//         console.log('Table names:', tableNames);
//     })
