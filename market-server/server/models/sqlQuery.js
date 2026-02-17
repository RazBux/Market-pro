// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./docs/income_statements.sqlite');

// // ✅ Alpha Vantage API configuration
// // const API_KEY = "0AQXEXJF4KHCIC6C"; // Your API key is safe on the backend!
// // const API_KEY = "IT26ULW3O8DRRI5X"; //second api key 
// const API_KEY = "0IBY3T6T7ST8B9LX"; //tird api key 


// const BASE_URL = "https://www.alphavantage.co/query";

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
      
//       if (data.length > 0) {
//         console.log('First row sample:', data[0]);
//       }

//       resolve(data);
//     });
//   });
// }

// function create_sql_query({ tableName, columnList, limit }) {
//   var columns;
//   if (columnList) {
//     columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
//   } else {
//     columns = "*";
//   }
  
//   let query = `SELECT ${columns} FROM ${tableName}`;
  
//   if (limit) {
//     query += ` LIMIT ${limit}`;
//   }
  
//   query += ';';

//   return getDataByQuery(query);
// }

// // ========================================
// // ✅ NEW: COMPANY SEARCH FUNCTION
// // ========================================

// /**
//  * Search for companies using Alpha Vantage API
//  * This keeps the API key secure on the backend
//  */
// async function searchCompanies(keywords) {
//     console.log(`🔍 Searching for companies with keywords: ${keywords}`);
    
//     if (!keywords || keywords.trim().length < 1) {
//         return {
//             success: false,
//             results: [],
//             message: "Please provide search keywords"
//         };
//     }

//     try {
//         const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${API_KEY}`;
        
//         const response = await fetch(url);
//         const data = await response.json();

//         // Check for API errors
//         if (data["Error Message"]) {
//             return {
//                 success: false,
//                 results: [],
//                 message: data["Error Message"]
//             };
//         }

//         if (data["Note"]) {
//             return {
//                 success: false,
//                 results: [],
//                 message: "API rate limit reached. Please wait a moment and try again."
//             };
//         }

//         if (data["Information"]) {
//             return {
//                 success: false,
//                 results: [],
//                 message: data["Information"]
//             };
//         }

//         // Parse results
//         const matches = data.bestMatches || [];
        
//         // Filter for US stocks only and format results
//         const formattedResults = matches
//             .filter(match => {
//                 const region = match["4. region"] || "";
//                 const type = match["3. type"] || "";
//                 return region === "United States" && type === "Equity";
//             })
//             .map(match => ({
//                 symbol: match["1. symbol"],
//                 name: match["2. name"],
//                 type: match["3. type"],
//                 region: match["4. region"],
//                 currency: match["8. currency"]
//             }))
//             .slice(0, 20);

//         console.log(`✅ Found ${formattedResults.length} US stocks`);

//         return {
//             success: true,
//             results: formattedResults,
//             message: formattedResults.length > 0 
//                 ? `Found ${formattedResults.length} results` 
//                 : "No US stocks found"
//         };

//     } catch (error) {
//         console.error('❌ Error searching companies:', error);
//         return {
//             success: false,
//             results: [],
//             message: "Failed to search companies. Please try again."
//         };
//     }
// }

// /**
//  * Get company name from Alpha Vantage API
//  */
// async function getCompanyName(symbol) {
//     console.log(`📝 Fetching company name for: ${symbol}`);
    
//     try {
//         const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${API_KEY}`;
//         const response = await fetch(url);
//         const data = await response.json();

//         if (data.bestMatches && data.bestMatches.length > 0) {
//             const exactMatch = data.bestMatches.find(
//                 match => match["1. symbol"] === symbol
//             );

//             if (exactMatch) {
//                 const name = exactMatch["2. name"];
//                 console.log(`✅ Found name: ${name}`);
//                 return {
//                     success: true,
//                     symbol: symbol,
//                     name: name
//                 };
//             }
//         }

//         return {
//             success: false,
//             symbol: symbol,
//             name: symbol,
//             message: "Company name not found"
//         };
//     } catch (error) {
//         console.error(`❌ Error fetching company name for ${symbol}:`, error);
//         return {
//             success: false,
//             symbol: symbol,
//             name: symbol,
//             message: error.message
//         };
//     }
// }

// /**
//  * Get company names for multiple symbols (batch)
//  */
// async function getCompanyNamesBatch(symbols) {
//     console.log(`📝 Fetching names for ${symbols.length} symbols`);
    
//     const results = [];
    
//     for (const symbol of symbols) {
//         const result = await getCompanyName(symbol);
//         results.push(result);
        
//         // Rate limiting: wait 12 seconds between calls (5 per minute limit)
//         if (symbols.indexOf(symbol) < symbols.length - 1) {
//             await new Promise(resolve => setTimeout(resolve, 12000));
//         }
//     }
    
//     return {
//         success: true,
//         companies: results
//     };
// }

// // ========================================
// // EXISTING COMPANY MANAGEMENT FUNCTIONS
// // ========================================

// function sanitizeSymbol(symbol) {
//     return (symbol || "").toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");
// }

// function getLatestFiscalDate(symbol, period) {
//     return new Promise((resolve, reject) => {
//         const tableName = `income_statement_${sanitizeSymbol(symbol)}_${period}`;
        
//         db.get(
//             `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
//             [tableName],
//             (err, row) => {
//                 if (err) {
//                     reject(err);
//                     return;
//                 }
                
//                 if (!row) {
//                     resolve(null);
//                     return;
//                 }
                
//                 db.get(
//                     `SELECT fiscalDateEnding FROM "${tableName}" ORDER BY fiscalDateEnding DESC LIMIT 1`,
//                     [],
//                     (err, row) => {
//                         if (err) {
//                             reject(err);
//                         } else {
//                             resolve(row ? row.fiscalDateEnding : null);
//                         }
//                     }
//                 );
//             }
//         );
//     });
// }

// function isDataFresh(latestDate, period) {
//     if (!latestDate) return false;
    
//     const latest = new Date(latestDate);
//     const now = new Date();
//     const diffMonths = (now.getFullYear() - latest.getFullYear()) * 12 + 
//                       (now.getMonth() - latest.getMonth());
    
//     if (period === 'quarterly') {
//         return diffMonths < 3;
//     } else {
//         return diffMonths < 12;
//     }
// }

// async function fetchIncomeStatement(symbol) {
//     const url = `${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`;
    
//     try {
//         const response = await fetch(url);
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         if (data["Error Message"]) {
//             throw new Error(`Invalid symbol or API error: ${data["Error Message"]}`);
//         }
        
//         if (data["Note"]) {
//             throw new Error(`API Rate Limit: ${data["Note"]}`);
//         }
        
//         if (data["Information"]) {
//             throw new Error(`API Information: ${data["Information"]}`);
//         }
        
//         return data;
//     } catch (error) {
//         console.error(`Error fetching data for ${symbol}:`, error.message);
//         throw error;
//     }
// }

// function inferColumnsPreserveOrder(reports) {
//     const cols = [];
//     const seen = new Set();
    
//     for (const report of reports) {
//         for (const key of Object.keys(report)) {
//             if (!seen.has(key)) {
//                 seen.add(key);
//                 cols.push(key);
//             }
//         }
//     }
    
//     return cols;
// }

// function createTable(tableName, columns) {
//     return new Promise((resolve, reject) => {
//         const ddlCols = [
//             'id INTEGER PRIMARY KEY AUTOINCREMENT',
//             'symbol TEXT NOT NULL',
//             'row_order INTEGER NOT NULL'
//         ];
        
//         for (const col of columns) {
//             if (col !== 'id' && col !== 'symbol') {
//                 ddlCols.push(`"${col}" TEXT`);
//             }
//         }
        
//         ddlCols.push('raw_json TEXT');
        
//         const uniqueClause = columns.includes('fiscalDateEnding') 
//             ? ', UNIQUE(symbol, "fiscalDateEnding") ON CONFLICT REPLACE'
//             : '';
        
//         const ddl = `
//             CREATE TABLE IF NOT EXISTS "${tableName}" (
//                 ${ddlCols.join(', ')}
//                 ${uniqueClause}
//             );
//         `;
        
//         db.run(ddl, (err) => {
//             if (err) reject(err);
//             else resolve();
//         });
//     });
// }

// function insertReports(tableName, symbol, reports, columns) {
//     return new Promise((resolve, reject) => {
//         if (!reports || reports.length === 0) {
//             resolve();
//             return;
//         }
        
//         const insertCols = ['symbol', 'row_order'];
//         for (const col of columns) {
//             if (col !== 'id' && col !== 'symbol') {
//                 insertCols.push(col);
//             }
//         }
//         insertCols.push('raw_json');
        
//         const colSql = insertCols.map(c => 
//             (c !== 'symbol' && c !== 'row_order' && c !== 'raw_json') ? `"${c}"` : c
//         ).join(', ');
        
//         const placeholders = insertCols.map(() => '?').join(', ');
//         const sql = `INSERT INTO "${tableName}" (${colSql}) VALUES (${placeholders});`;
        
//         const stmt = db.prepare(sql);
        
//         reports.forEach((report, index) => {
//             const row = [symbol, index];
//             for (const col of columns) {
//                 if (col !== 'id' && col !== 'symbol') {
//                     row.push(report[col] || null);
//                 }
//             }
//             row.push(JSON.stringify(report));
            
//             stmt.run(row);
//         });
        
//         stmt.finalize((err) => {
//             if (err) reject(err);
//             else resolve();
//         });
//     });
// }

// async function addCompanyToDatabase(symbol) {
//     try {
//         console.log(`\n📊 Processing symbol: ${symbol}`);
        
//         const sanitizedSymbol = sanitizeSymbol(symbol);
        
//         const latestAnnual = await getLatestFiscalDate(symbol, 'annual');
//         const latestQuarterly = await getLatestFiscalDate(symbol, 'quarterly');
        
//         const annualFresh = isDataFresh(latestAnnual, 'annual');
//         const quarterlyFresh = isDataFresh(latestQuarterly, 'quarterly');
        
//         if (annualFresh && quarterlyFresh) {
//             console.log(`✅ Data is fresh for ${symbol}. Skipping API call.`);
//             console.log(`   Latest annual: ${latestAnnual}`);
//             console.log(`   Latest quarterly: ${latestQuarterly}`);
            
//             return {
//                 success: true,
//                 message: 'Data is already fresh',
//                 symbol: sanitizedSymbol,
//                 annualCount: 0,
//                 quarterlyCount: 0
//             };
//         }
        
//         console.log(`🔄 Fetching fresh data from API...`);
//         if (latestAnnual) console.log(`   Current annual data: ${latestAnnual}`);
//         if (latestQuarterly) console.log(`   Current quarterly data: ${latestQuarterly}`);
        
//         const data = await fetchIncomeStatement(symbol);
        
//         if (!data.annualReports && !data.quarterlyReports) {
//             throw new Error('No financial data available for this symbol');
//         }
        
//         const annualReports = data.annualReports || [];
//         const quarterlyReports = data.quarterlyReports || [];
        
//         let annualCount = 0;
//         let quarterlyCount = 0;
        
//         if (annualReports.length > 0) {
//             const annualCols = inferColumnsPreserveOrder(annualReports);
//             const annualTable = `income_statement_${sanitizedSymbol}_annual`;
            
//             await createTable(annualTable, annualCols);
            
//             await new Promise((resolve, reject) => {
//                 db.run(`DELETE FROM "${annualTable}" WHERE symbol = ?`, [sanitizedSymbol], (err) => {
//                     if (err) reject(err);
//                     else resolve();
//                 });
//             });
            
//             await insertReports(annualTable, sanitizedSymbol, annualReports, annualCols);
//             annualCount = annualReports.length;
//             console.log(`   ✅ Imported ${annualCount} annual reports`);
//         }
        
//         if (quarterlyReports.length > 0) {
//             const quarterlyCols = inferColumnsPreserveOrder(quarterlyReports);
//             const quarterlyTable = `income_statement_${sanitizedSymbol}_quarterly`;
            
//             await createTable(quarterlyTable, quarterlyCols);
            
//             await new Promise((resolve, reject) => {
//                 db.run(`DELETE FROM "${quarterlyTable}" WHERE symbol = ?`, [sanitizedSymbol], (err) => {
//                     if (err) reject(err);
//                     else resolve();
//                 });
//             });
            
//             await insertReports(quarterlyTable, sanitizedSymbol, quarterlyReports, quarterlyCols);
//             quarterlyCount = quarterlyReports.length;
//             console.log(`   ✅ Imported ${quarterlyCount} quarterly reports`);
//         }
        
//         return {
//             success: true,
//             message: `Successfully added ${symbol}`,
//             symbol: sanitizedSymbol,
//             annualCount: annualCount,
//             quarterlyCount: quarterlyCount
//         };
        
//     } catch (error) {
//         console.error(`❌ Error processing ${symbol}:`, error.message);
//         return {
//             success: false,
//             message: error.message,
//             symbol: sanitizeSymbol(symbol),
//             annualCount: 0,
//             quarterlyCount: 0
//         };
//     }
// }


// module.exports = {
//   getTableColumns,
//   getAllTableAndThierColumns,
//   getAllTableNames,
//   getDataByQuery,
//   create_sql_query,
//   addCompanyToDatabase,
//   searchCompanies,          // ✅ NEW: Export search function
//   getCompanyName,           // ✅ NEW: Export get name function
//   getCompanyNamesBatch      // ✅ NEW: Export batch function
// };


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./docs/income_statements.sqlite');

// ─── API Key Rotation ─────────────────────────────────────────────────────────
// Only used for: (1) SYMBOL_SEARCH when user searches, (2) INCOME_STATEMENT when adding a company
// NOT used for company name lookups — those come free from the DB
const API_KEYS = [
    "0AQXEXJF4KHCIC6C",  // key 1
    "IT26ULW3O8DRRI5X",  // key 2
    "0IBY3T6T7ST8B9LX",  // key 3
    "8YCY8NSJ6HZ6WYBK",  // key 4 (new)
];
let currentKeyIndex = 0;

function getNextApiKey() {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.log(`🔑 Using API key ${currentKeyIndex + 1}/${API_KEYS.length}`);
    return key;
}

const BASE_URL = "https://www.alphavantage.co/query";

// ─── DB Cache Table ───────────────────────────────────────────────────────────
// company_names stores names we get FOR FREE from search results.
// For companies already in DB, we extract names from the income statement tables directly.
db.run(`
    CREATE TABLE IF NOT EXISTS company_names (
        symbol     TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) console.error('Error creating company_names table:', err);
    else console.log('✅ company_names cache table ready');
});

// ─── Core DB Helpers ──────────────────────────────────────────────────────────

function getTableColumns({ tableName }) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName});`, (err, rows) => {
            if (err) { reject(err); return; }
            resolve(rows.map(row => row.name));
        });
    });
}

function getAllTableAndThierColumns() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table';", async (err, tables) => {
            if (err) { reject(err); return; }
            const cols = await Promise.all(tables.map(t => getTableColumns({ tableName: t.name })));
            const result = {};
            tables.forEach((t, i) => { result[t.name] = cols[i]; });
            resolve(result);
        });
    });
}

function getAllTableNames() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
            if (err) { reject(err); return; }
            resolve(tables.map(t => t.name));
        });
    });
}

function getDataByQuery(sqlQuery) {
    console.log(`📊 SQL: ${sqlQuery.substring(0, 100)}`);
    return new Promise((resolve, reject) => {
        db.all(sqlQuery, (err, rows) => {
            if (err) { console.error('❌ SQL Error:', err.message); reject(err); return; }
            resolve(rows.map(row => ({ ...row })));
        });
    });
}

function create_sql_query({ tableName, columnList, limit }) {
    const columns = Array.isArray(columnList) && columnList.length > 0 ? columnList.join(', ') : '*';
    let query = `SELECT ${columns} FROM ${tableName}`;
    if (limit) query += ` LIMIT ${limit}`;
    return getDataByQuery(query + ';');
}

// ─── Company Name Cache (DB-only, no API) ────────────────────────────────────

function saveCachedName(symbol, name) {
    return new Promise((resolve) => {
        db.run(
            `INSERT OR REPLACE INTO company_names (symbol, name, fetched_at) VALUES (?, ?, datetime('now'))`,
            [symbol, name],
            (err) => { if (err) console.error(`Cache write failed for ${symbol}:`, err); resolve(); }
        );
    });
}

function getCachedName(symbol) {
    return new Promise((resolve) => {
        db.get(`SELECT name FROM company_names WHERE symbol = ?`, [symbol], (err, row) => {
            resolve(err || !row ? null : row.name);
        });
    });
}

function getCachedNamesBatch(symbols) {
    return new Promise((resolve) => {
        if (!symbols || symbols.length === 0) { resolve({}); return; }
        const placeholders = symbols.map(() => '?').join(',');
        db.all(
            `SELECT symbol, name FROM company_names WHERE symbol IN (${placeholders})`,
            symbols,
            (err, rows) => {
                if (err || !rows) { resolve({}); return; }
                const map = {};
                rows.forEach(r => { map[r.symbol] = r.name; });
                resolve(map);
            }
        );
    });
}

// ─── Extract Name from Existing Income Statement Table ────────────────────────
// Your DB tables are named: income_statement_AAPL_annual, income_statement_MSFT_quarterly etc.
// The income statement data itself also has a "reportedCurrency" and other fields but NOT company name.
// However, Alpha Vantage INCOME_STATEMENT response includes a "symbol" field at root level.
// We store it in raw_json — let's try to extract name from there, or just use symbol as fallback.
// 
// Better: extract the name from the company_names cache populated at add-time (see addCompanyToDatabase).
// This means: NO API calls ever needed for name display — name is cached when company is added.

/**
 * Get name from DB cache only. No API call. Returns symbol as fallback.
 */
async function getCompanyName(symbol) {
    const cached = await getCachedName(symbol);
    if (cached) {
        console.log(`✅ [DB] ${symbol} → ${cached}`);
        return { success: true, symbol, name: cached };
    }
    // Not in cache — return symbol itself. Name will appear after next search or re-add.
    console.log(`⚠️  [NO CACHE] ${symbol} — returning symbol as name (no API call)`);
    return { success: false, symbol, name: symbol, message: 'Not cached yet' };
}

/**
 * Get names for multiple symbols — pure DB, zero API calls.
 * Strategy:
 *  1. Single DB query for all symbols at once
 *  2. Missing ones just show the symbol ticker (acceptable UX, no rate limits)
 */
async function getCompanyNamesBatch(symbols) {
    if (!symbols || symbols.length === 0) return { success: true, companies: [] };

    console.log(`📦 Batch name lookup for ${symbols.length} symbols (DB only, no API)`);

    const cachedMap = await getCachedNamesBatch(symbols);
    const hits = Object.keys(cachedMap).length;
    const misses = symbols.filter(s => !cachedMap[s]);

    console.log(`✅ DB hits: ${hits}/${symbols.length}${misses.length ? ` | Missing: ${misses.join(', ')}` : ''}`);

    return {
        success: true,
        companies: symbols.map(s => ({
            success: !!cachedMap[s],
            symbol: s,
            name: cachedMap[s] || s  // fallback to ticker — never calls API
        }))
    };
}

// ─── Company Search ───────────────────────────────────────────────────────────
// This is the ONLY place we call Alpha Vantage for names — as a side effect of search.
// Search is always user-triggered, so this is expected.

async function searchCompanies(keywords) {
    console.log(`🔍 Searching: "${keywords}"`);
    if (!keywords || keywords.trim().length < 1)
        return { success: false, results: [], message: "Please provide search keywords" };

    try {
        const apiKey = getNextApiKey();
        const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data["Error Message"]) return { success: false, results: [], message: data["Error Message"] };
        if (data["Note"] && !data.bestMatches) return { success: false, results: [], message: "API rate limit reached. Please try again later." };
        if (data["Information"] && !data.bestMatches) return { success: false, results: [], message: "Daily API limit reached. Try again tomorrow or add more API keys." };
        if (data["Information"]) console.log("AV notice (non-blocking, results present)");
        const matches = data.bestMatches || [];
        const results = matches
            .filter(m => m["4. region"] === "United States" && m["3. type"] === "Equity")
            .map(m => ({
                symbol:   m["1. symbol"],
                name:     m["2. name"],
                type:     m["3. type"],
                region:   m["4. region"],
                currency: m["8. currency"]
            }))
            .slice(0, 20);

        // ✅ Cache names as a free side-effect of search — no extra API calls
        await Promise.all(results.map(r => saveCachedName(r.symbol, r.name)));
        console.log(`✅ Cached ${results.length} names from search results`);

        return { success: true, results, message: `Found ${results.length} results` };

    } catch (error) {
        console.error('❌ Search error:', error);
        return { success: false, results: [], message: "Search failed. Please try again." };
    }
}

// ─── Company Management ───────────────────────────────────────────────────────

function sanitizeSymbol(symbol) {
    return (symbol || "").toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");
}

function getLatestFiscalDate(symbol, period) {
    return new Promise((resolve, reject) => {
        const tableName = `income_statement_${sanitizeSymbol(symbol)}_${period}`;
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            if (err) { reject(err); return; }
            if (!row) { resolve(null); return; }
            db.get(
                `SELECT fiscalDateEnding FROM "${tableName}" ORDER BY fiscalDateEnding DESC LIMIT 1`,
                [],
                (err, row) => { err ? reject(err) : resolve(row?.fiscalDateEnding || null); }
            );
        });
    });
}

function isDataFresh(latestDate, period) {
    if (!latestDate) return false;
    const diffMonths = (new Date() - new Date(latestDate)) / (1000 * 60 * 60 * 24 * 30);
    return period === 'quarterly' ? diffMonths < 3 : diffMonths < 12;
}

async function fetchIncomeStatement(symbol) {
    const apiKey = getNextApiKey();
    const url = `${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    if (data["Error Message"]) throw new Error(data["Error Message"]);
    if (data["Note"])          throw new Error(`Rate limit: ${data["Note"]}`);
    if (data["Information"]) console.log("AV notice on INCOME_STATEMENT (non-blocking)");
    return data;
}

function inferColumnsPreserveOrder(reports) {
    const cols = [], seen = new Set();
    for (const r of reports) for (const k of Object.keys(r)) if (!seen.has(k)) { seen.add(k); cols.push(k); }
    return cols;
}

function createTable(tableName, columns) {
    return new Promise((resolve, reject) => {
        const ddlCols = ['id INTEGER PRIMARY KEY AUTOINCREMENT', 'symbol TEXT NOT NULL', 'row_order INTEGER NOT NULL'];
        for (const col of columns) if (col !== 'id' && col !== 'symbol') ddlCols.push(`"${col}" TEXT`);
        ddlCols.push('raw_json TEXT');
        const unique = columns.includes('fiscalDateEnding') ? ', UNIQUE(symbol, "fiscalDateEnding") ON CONFLICT REPLACE' : '';
        db.run(`CREATE TABLE IF NOT EXISTS "${tableName}" (${ddlCols.join(', ')} ${unique})`, e => e ? reject(e) : resolve());
    });
}

function insertReports(tableName, symbol, reports, columns) {
    return new Promise((resolve, reject) => {
        if (!reports?.length) { resolve(); return; }
        const insertCols = ['symbol', 'row_order', ...columns.filter(c => c !== 'id' && c !== 'symbol'), 'raw_json'];
        const colSql = insertCols.map(c => ['symbol','row_order','raw_json'].includes(c) ? c : `"${c}"`).join(', ');
        const sql = `INSERT INTO "${tableName}" (${colSql}) VALUES (${insertCols.map(() => '?').join(', ')});`;
        const stmt = db.prepare(sql);
        reports.forEach((report, i) => {
            const row = [symbol, i, ...columns.filter(c => c !== 'id' && c !== 'symbol').map(c => report[c] || null), JSON.stringify(report)];
            stmt.run(row);
        });
        stmt.finalize(e => e ? reject(e) : resolve());
    });
}

async function addCompanyToDatabase(symbol) {
    try {
        console.log(`\n📊 Adding: ${symbol}`);
        const sanitizedSymbol = sanitizeSymbol(symbol);

        const [latestAnnual, latestQuarterly] = await Promise.all([
            getLatestFiscalDate(symbol, 'annual'),
            getLatestFiscalDate(symbol, 'quarterly')
        ]);

        if (isDataFresh(latestAnnual, 'annual') && isDataFresh(latestQuarterly, 'quarterly')) {
            console.log(`✅ Fresh data exists for ${symbol}`);
            return { success: true, message: 'Data is already fresh', symbol: sanitizedSymbol, annualCount: 0, quarterlyCount: 0 };
        }

        const data = await fetchIncomeStatement(symbol);
        if (!data.annualReports && !data.quarterlyReports)
            throw new Error('No financial data available for this symbol');

        const annualReports    = data.annualReports    || [];
        const quarterlyReports = data.quarterlyReports || [];
        let annualCount = 0, quarterlyCount = 0;

        if (annualReports.length > 0) {
            const cols = inferColumnsPreserveOrder(annualReports);
            const table = `income_statement_${sanitizedSymbol}_annual`;
            await createTable(table, cols);
            await new Promise((res, rej) => db.run(`DELETE FROM "${table}" WHERE symbol = ?`, [sanitizedSymbol], e => e ? rej(e) : res()));
            await insertReports(table, sanitizedSymbol, annualReports, cols);
            annualCount = annualReports.length;
        }

        if (quarterlyReports.length > 0) {
            const cols = inferColumnsPreserveOrder(quarterlyReports);
            const table = `income_statement_${sanitizedSymbol}_quarterly`;
            await createTable(table, cols);
            await new Promise((res, rej) => db.run(`DELETE FROM "${table}" WHERE symbol = ?`, [sanitizedSymbol], e => e ? rej(e) : res()));
            await insertReports(table, sanitizedSymbol, quarterlyReports, cols);
            quarterlyCount = quarterlyReports.length;
        }

        // ✅ Cache the name from the Alpha Vantage INCOME_STATEMENT response
        // The response includes the company name in the symbol field — 
        // but AV doesn't return the full name in INCOME_STATEMENT.
        // Name will be cached naturally the next time the user searches for this symbol.
        // If it's already cached (from a search), we're good.
        const alreadyCached = await getCachedName(sanitizedSymbol);
        if (!alreadyCached) {
            // Save symbol as placeholder — will be overwritten by real name on next search
            await saveCachedName(sanitizedSymbol, sanitizedSymbol);
            console.log(`⚠️  Name not yet cached for ${sanitizedSymbol} — will appear after first search`);
        }

        console.log(`✅ ${symbol}: ${annualCount} annual, ${quarterlyCount} quarterly`);
        return { success: true, message: `Successfully added ${symbol}`, symbol: sanitizedSymbol, annualCount, quarterlyCount };

    } catch (error) {
        console.error(`❌ Error adding ${symbol}:`, error.message);
        return { success: false, message: error.message, symbol: sanitizeSymbol(symbol), annualCount: 0, quarterlyCount: 0 };
    }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
    getTableColumns,
    getAllTableAndThierColumns,
    getAllTableNames,
    getDataByQuery,
    create_sql_query,
    addCompanyToDatabase,
    searchCompanies,
    getCompanyName,
    getCompanyNamesBatch,
};