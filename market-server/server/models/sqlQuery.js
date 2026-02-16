// const sqlite3 = require('sqlite3').verbose(); // Import the sqlite3 package
// const db = new sqlite3.Database('./docs/income_statements.sqlite'); // 

// //retrieve all the column from the specific table.
// function getTableColumns({ tableName }) {
//   return new Promise((resolve, reject) => {
//     const query = `PRAGMA table_info(${tableName});`;

//     db.all(query, (err, rows) => {
//       if (err) {
//         console.error(`Error getting columns for ${tableName}:`, err);
//         reject(err);
//       } else {
//         const columns = rows.map(row => row.name);
//         console.log(`${tableName} columns:`, JSON.stringify(columns, null, 2));
//         resolve(columns);
//       }
//     });
//   });
// }

// // get all table and their columns from a db.
// function getAllTableAndThierColumns() {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT name FROM sqlite_master WHERE type='table';";

//     db.all(query, async (err, tables) => {
//       if (err) {
//         console.error('Error getting tables:', err);
//         reject(err);
//         return;
//       }

//       const tableColumnsPromises = tables.map(table => getTableColumns({ tableName: table.name }));
//       const tableColumns = await Promise.all(tableColumnsPromises);

//       const result = {};
//       tables.forEach((table, index) => {
//         result[table.name] = tableColumns[index];
//       });
//       resolve(result);
//     });
//   });
// }


// //get all the table name (only) from a db. 
// function getAllTableNames() {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT name FROM sqlite_master WHERE type='table';";

//     db.all(query, (err, tables) => {
//       if (err) {
//         console.error('Error getting table names:', err);
//         reject(err);
//         return;
//       }
//       const tableNames = tables.map(table => table.name);
//       console.log(`Table names: ${tableNames.join(', ')}`);
//       resolve(tableNames);
//     });
//   });
// }


// // ✅ IMPROVED: Better error handling and logging
// function getDataByQuery(sqlQuery) {
//   console.log(`📊 Executing SQL query: ${sqlQuery}`);
  
//   return new Promise((resolve, reject) => {
//     db.all(sqlQuery, (err, rows) => {
//       if (err) {
//         console.error('❌ SQL Query Error:', err.message);
//         console.error('Query was:', sqlQuery);
//         reject(err);
//         return;
//       }
      
//       const data = rows.map(row => ({ ...row }));
//       console.log(`✅ Query returned ${data.length} rows`);
      
//       // Only log first row to avoid console spam
//       if (data.length > 0) {
//         console.log('First row sample:', data[0]);
//       }

//       resolve(data);
//     });
//   });
// }

// // ✅ IMPROVED: Added limit support
// function create_sql_query({ tableName, columnList, limit }) {
//   // Ensure columnList is an array
//   var columns;
//   if (columnList) {
//     columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
//   } else {
//     columns = "*";
//   }
  
//   // Create the SQL query string
//   let query = `SELECT ${columns} FROM ${tableName}`;
  
//   // ✅ NEW: Add LIMIT if provided
//   if (limit) {
//     query += ` LIMIT ${limit}`;
//   }
  
//   query += ';';

//   return getDataByQuery(query);
// }


// module.exports = {
//   getTableColumns,
//   getAllTableAndThierColumns,
//   getAllTableNames,
//   getDataByQuery,
//   create_sql_query
// };


// /* ===== TESTING EXAMPLES =====

// // Test getting all table names
// getAllTableNames()
//   .then(tableNames => {
//     console.log('Table names:', tableNames);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

// // Test getting columns
// getTableColumns({ tableName: 'income_statement_AAPL_quarterly' })
//   .then(columns => {
//     console.log('Columns:', columns);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

// // Test creating and executing a query
// create_sql_query({ 
//   tableName: 'income_statement_AAPL_quarterly',
//   columnList: ['fiscalDateEnding', 'totalRevenue', 'netIncome'],
//   limit: '5'
// })
//   .then(data => {
//     console.log('Data:', data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });

// */

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./docs/income_statements.sqlite');

// ✅ Alpha Vantage API configuration
const API_KEY = "0AQXEXJF4KHCIC6C"; // Your API key is safe on the backend!
const BASE_URL = "https://www.alphavantage.co/query";

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
      
      if (data.length > 0) {
        console.log('First row sample:', data[0]);
      }

      resolve(data);
    });
  });
}

function create_sql_query({ tableName, columnList, limit }) {
  var columns;
  if (columnList) {
    columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
  } else {
    columns = "*";
  }
  
  let query = `SELECT ${columns} FROM ${tableName}`;
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  query += ';';

  return getDataByQuery(query);
}

// ========================================
// ✅ NEW: COMPANY SEARCH FUNCTION
// ========================================

/**
 * Search for companies using Alpha Vantage API
 * This keeps the API key secure on the backend
 */
async function searchCompanies(keywords) {
    console.log(`🔍 Searching for companies with keywords: ${keywords}`);
    
    if (!keywords || keywords.trim().length < 1) {
        return {
            success: false,
            results: [],
            message: "Please provide search keywords"
        };
    }

    try {
        const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        // Check for API errors
        if (data["Error Message"]) {
            return {
                success: false,
                results: [],
                message: data["Error Message"]
            };
        }

        if (data["Note"]) {
            return {
                success: false,
                results: [],
                message: "API rate limit reached. Please wait a moment and try again."
            };
        }

        if (data["Information"]) {
            return {
                success: false,
                results: [],
                message: data["Information"]
            };
        }

        // Parse results
        const matches = data.bestMatches || [];
        
        // Filter for US stocks only and format results
        const formattedResults = matches
            .filter(match => {
                const region = match["4. region"] || "";
                const type = match["3. type"] || "";
                return region === "United States" && type === "Equity";
            })
            .map(match => ({
                symbol: match["1. symbol"],
                name: match["2. name"],
                type: match["3. type"],
                region: match["4. region"],
                currency: match["8. currency"]
            }))
            .slice(0, 20);

        console.log(`✅ Found ${formattedResults.length} US stocks`);

        return {
            success: true,
            results: formattedResults,
            message: formattedResults.length > 0 
                ? `Found ${formattedResults.length} results` 
                : "No US stocks found"
        };

    } catch (error) {
        console.error('❌ Error searching companies:', error);
        return {
            success: false,
            results: [],
            message: "Failed to search companies. Please try again."
        };
    }
}

/**
 * Get company name from Alpha Vantage API
 */
async function getCompanyName(symbol) {
    console.log(`📝 Fetching company name for: ${symbol}`);
    
    try {
        const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.bestMatches && data.bestMatches.length > 0) {
            const exactMatch = data.bestMatches.find(
                match => match["1. symbol"] === symbol
            );

            if (exactMatch) {
                const name = exactMatch["2. name"];
                console.log(`✅ Found name: ${name}`);
                return {
                    success: true,
                    symbol: symbol,
                    name: name
                };
            }
        }

        return {
            success: false,
            symbol: symbol,
            name: symbol,
            message: "Company name not found"
        };
    } catch (error) {
        console.error(`❌ Error fetching company name for ${symbol}:`, error);
        return {
            success: false,
            symbol: symbol,
            name: symbol,
            message: error.message
        };
    }
}

/**
 * Get company names for multiple symbols (batch)
 */
async function getCompanyNamesBatch(symbols) {
    console.log(`📝 Fetching names for ${symbols.length} symbols`);
    
    const results = [];
    
    for (const symbol of symbols) {
        const result = await getCompanyName(symbol);
        results.push(result);
        
        // Rate limiting: wait 12 seconds between calls (5 per minute limit)
        if (symbols.indexOf(symbol) < symbols.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 12000));
        }
    }
    
    return {
        success: true,
        companies: results
    };
}

// ========================================
// EXISTING COMPANY MANAGEMENT FUNCTIONS
// ========================================

function sanitizeSymbol(symbol) {
    return (symbol || "").toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");
}

function getLatestFiscalDate(symbol, period) {
    return new Promise((resolve, reject) => {
        const tableName = `income_statement_${sanitizeSymbol(symbol)}_${period}`;
        
        db.get(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
            [tableName],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (!row) {
                    resolve(null);
                    return;
                }
                
                db.get(
                    `SELECT fiscalDateEnding FROM "${tableName}" ORDER BY fiscalDateEnding DESC LIMIT 1`,
                    [],
                    (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row ? row.fiscalDateEnding : null);
                        }
                    }
                );
            }
        );
    });
}

function isDataFresh(latestDate, period) {
    if (!latestDate) return false;
    
    const latest = new Date(latestDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - latest.getFullYear()) * 12 + 
                      (now.getMonth() - latest.getMonth());
    
    if (period === 'quarterly') {
        return diffMonths < 3;
    } else {
        return diffMonths < 12;
    }
}

async function fetchIncomeStatement(symbol) {
    const url = `${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data["Error Message"]) {
            throw new Error(`Invalid symbol or API error: ${data["Error Message"]}`);
        }
        
        if (data["Note"]) {
            throw new Error(`API Rate Limit: ${data["Note"]}`);
        }
        
        if (data["Information"]) {
            throw new Error(`API Information: ${data["Information"]}`);
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        throw error;
    }
}

function inferColumnsPreserveOrder(reports) {
    const cols = [];
    const seen = new Set();
    
    for (const report of reports) {
        for (const key of Object.keys(report)) {
            if (!seen.has(key)) {
                seen.add(key);
                cols.push(key);
            }
        }
    }
    
    return cols;
}

function createTable(tableName, columns) {
    return new Promise((resolve, reject) => {
        const ddlCols = [
            'id INTEGER PRIMARY KEY AUTOINCREMENT',
            'symbol TEXT NOT NULL',
            'row_order INTEGER NOT NULL'
        ];
        
        for (const col of columns) {
            if (col !== 'id' && col !== 'symbol') {
                ddlCols.push(`"${col}" TEXT`);
            }
        }
        
        ddlCols.push('raw_json TEXT');
        
        const uniqueClause = columns.includes('fiscalDateEnding') 
            ? ', UNIQUE(symbol, "fiscalDateEnding") ON CONFLICT REPLACE'
            : '';
        
        const ddl = `
            CREATE TABLE IF NOT EXISTS "${tableName}" (
                ${ddlCols.join(', ')}
                ${uniqueClause}
            );
        `;
        
        db.run(ddl, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function insertReports(tableName, symbol, reports, columns) {
    return new Promise((resolve, reject) => {
        if (!reports || reports.length === 0) {
            resolve();
            return;
        }
        
        const insertCols = ['symbol', 'row_order'];
        for (const col of columns) {
            if (col !== 'id' && col !== 'symbol') {
                insertCols.push(col);
            }
        }
        insertCols.push('raw_json');
        
        const colSql = insertCols.map(c => 
            (c !== 'symbol' && c !== 'row_order' && c !== 'raw_json') ? `"${c}"` : c
        ).join(', ');
        
        const placeholders = insertCols.map(() => '?').join(', ');
        const sql = `INSERT INTO "${tableName}" (${colSql}) VALUES (${placeholders});`;
        
        const stmt = db.prepare(sql);
        
        reports.forEach((report, index) => {
            const row = [symbol, index];
            for (const col of columns) {
                if (col !== 'id' && col !== 'symbol') {
                    row.push(report[col] || null);
                }
            }
            row.push(JSON.stringify(report));
            
            stmt.run(row);
        });
        
        stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function addCompanyToDatabase(symbol) {
    try {
        console.log(`\n📊 Processing symbol: ${symbol}`);
        
        const sanitizedSymbol = sanitizeSymbol(symbol);
        
        const latestAnnual = await getLatestFiscalDate(symbol, 'annual');
        const latestQuarterly = await getLatestFiscalDate(symbol, 'quarterly');
        
        const annualFresh = isDataFresh(latestAnnual, 'annual');
        const quarterlyFresh = isDataFresh(latestQuarterly, 'quarterly');
        
        if (annualFresh && quarterlyFresh) {
            console.log(`✅ Data is fresh for ${symbol}. Skipping API call.`);
            console.log(`   Latest annual: ${latestAnnual}`);
            console.log(`   Latest quarterly: ${latestQuarterly}`);
            
            return {
                success: true,
                message: 'Data is already fresh',
                symbol: sanitizedSymbol,
                annualCount: 0,
                quarterlyCount: 0
            };
        }
        
        console.log(`🔄 Fetching fresh data from API...`);
        if (latestAnnual) console.log(`   Current annual data: ${latestAnnual}`);
        if (latestQuarterly) console.log(`   Current quarterly data: ${latestQuarterly}`);
        
        const data = await fetchIncomeStatement(symbol);
        
        if (!data.annualReports && !data.quarterlyReports) {
            throw new Error('No financial data available for this symbol');
        }
        
        const annualReports = data.annualReports || [];
        const quarterlyReports = data.quarterlyReports || [];
        
        let annualCount = 0;
        let quarterlyCount = 0;
        
        if (annualReports.length > 0) {
            const annualCols = inferColumnsPreserveOrder(annualReports);
            const annualTable = `income_statement_${sanitizedSymbol}_annual`;
            
            await createTable(annualTable, annualCols);
            
            await new Promise((resolve, reject) => {
                db.run(`DELETE FROM "${annualTable}" WHERE symbol = ?`, [sanitizedSymbol], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            await insertReports(annualTable, sanitizedSymbol, annualReports, annualCols);
            annualCount = annualReports.length;
            console.log(`   ✅ Imported ${annualCount} annual reports`);
        }
        
        if (quarterlyReports.length > 0) {
            const quarterlyCols = inferColumnsPreserveOrder(quarterlyReports);
            const quarterlyTable = `income_statement_${sanitizedSymbol}_quarterly`;
            
            await createTable(quarterlyTable, quarterlyCols);
            
            await new Promise((resolve, reject) => {
                db.run(`DELETE FROM "${quarterlyTable}" WHERE symbol = ?`, [sanitizedSymbol], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            await insertReports(quarterlyTable, sanitizedSymbol, quarterlyReports, quarterlyCols);
            quarterlyCount = quarterlyReports.length;
            console.log(`   ✅ Imported ${quarterlyCount} quarterly reports`);
        }
        
        return {
            success: true,
            message: `Successfully added ${symbol}`,
            symbol: sanitizedSymbol,
            annualCount: annualCount,
            quarterlyCount: quarterlyCount
        };
        
    } catch (error) {
        console.error(`❌ Error processing ${symbol}:`, error.message);
        return {
            success: false,
            message: error.message,
            symbol: sanitizeSymbol(symbol),
            annualCount: 0,
            quarterlyCount: 0
        };
    }
}


module.exports = {
  getTableColumns,
  getAllTableAndThierColumns,
  getAllTableNames,
  getDataByQuery,
  create_sql_query,
  addCompanyToDatabase,
  searchCompanies,          // ✅ NEW: Export search function
  getCompanyName,           // ✅ NEW: Export get name function
  getCompanyNamesBatch      // ✅ NEW: Export batch function
};