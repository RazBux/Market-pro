// //to start the code type in terminal >>>> npm run devStart
// //to kill the process id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
// const { graphqlHTTP } = require('express-graphql');
// const graphql = require('graphql');
// const { getTableColumns, getAllTableNames, getDataByQuery, create_sql_query } = require('../models/sqlQuery')

// const {
//     GraphQLSchema,
//     GraphQLObjectType,
//     GraphQLString,
//     GraphQLList,
//     GraphQLInt,
//     GraphQLFloat,
//     GraphQLScalarType
// } = require('graphql');


// const tableType = new GraphQLObjectType({
//     name: 'Tables',
//     description: 'Get Tables to filter',
//     fields: () => ({
//         tables: { type: GraphQLList(GraphQLString) }
//     })
// });

// const columnType = new GraphQLObjectType({
//     name: 'Columns',
//     description: 'Get columns to filter',
//     fields: () => ({
//         columns: { type: GraphQLList(GraphQLString) }
//     })
// });

// // Define a generic scalar type
// const GenericScalar = new GraphQLScalarType({
//     name: 'GenericScalar',
//     description: 'A generic scalar that can handle various data types',
//     serialize(value) {
//         return value; // return the value as is
//     }
// });

// // Define a dynamic GraphQL object type using the generic scalar
// const freeStyleType = new GraphQLObjectType({
//     name: 'FreeStyleType',
//     fields: () => ({
//         data: { type: GenericScalar }
//     })
// });

// // Define a dynamic GraphQL object type using the generic scalar
// const allDataType = new GraphQLObjectType({
//     name: 'AllDataOfCompany',
//     fields: () => ({
//         data: { type: GenericScalar }
//     })
// });


// const RootQuery = new GraphQLObjectType({
//     name: 'RootQuery',
//     description: 'Root Query - collect all the query for db.',
//     fields: () => ({
//         tableColumns: {
//             type: columnType,
//             description: 'Get all columns from table',
//             args: {
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED: Updated from 'tesla'
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { tableName } = args;
//                 const columnsName = await getTableColumns({tableName});
//                 return { columns: columnsName };
//             }
//         },
//         dbTables: {
//             type: tableType,
//             description: 'Get all table from db',
//             resolve: async (_, args) => {
//                 const tableNames = await getAllTableNames();
//                 return { tables: tableNames };
//             }
//         },
        
//         // ✅ NEW: Query that matches what the frontend expects
//         customQuery: {
//             type: new GraphQLList(freeStyleType),
//             description: 'Get data with custom column selection - MAIN QUERY FOR FRONTEND',
//             args: {
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED
//                 },
//                 columns: {
//                     type: GraphQLList(GraphQLString),
//                     defaultValue: ['fiscalDateEnding', 'totalRevenue'] // ✅ CHANGED
//                 },
//                 limit: {
//                     type: GraphQLString,
//                     description: 'Number of records to return'
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { tableName, columns, limit } = args;
                
//                 // Build query with optional LIMIT
//                 let query = `SELECT ${columns.join(', ')} FROM ${tableName}`;
//                 if (limit) {
//                     query += ` LIMIT ${limit}`;
//                 }
                
//                 const dataByQuery = await getDataByQuery(query);
                
//                 // Format the data for the dynamic type
//                 return dataByQuery.map(row => ({ data: row }));
//             }
//         },
        
//         // ✅ NEW: Company comparison query
//         compareCompanies: {
//             type: new GraphQLList(freeStyleType),
//             description: 'Compare metrics across multiple companies',
//             args: {
//                 companies: {
//                     type: GraphQLList(GraphQLString),
//                     defaultValue: ['AAPL', 'ENPH']
//                 },
//                 period: {
//                     type: GraphQLString,
//                     defaultValue: 'annual'
//                 },
//                 columns: {
//                     type: GraphQLList(GraphQLString),
//                     defaultValue: ['symbol', 'fiscalDateEnding', 'totalRevenue', 'netIncome']
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { companies, period, columns } = args;
//                 let allData = [];
                
//                 for (const company of companies) {
//                     const tableName = `income_statement_${company}_${period}`;
//                     const query = `SELECT ${columns.join(', ')} FROM ${tableName} LIMIT 5`;
                    
//                     try {
//                         const data = await getDataByQuery(query);
//                         allData = allData.concat(data);
//                     } catch (error) {
//                         console.error(`Error fetching data for ${company}:`, error);
//                     }
//                 }
                
//                 return allData.map(row => ({ data: row }));
//             }
//         },
        
//         // ✅ NEW: Get all tables (for frontend to list companies)
//         tables: {
//             type: tableType,
//             description: 'Get all available tables',
//             resolve: async () => {
//                 const tableNames = await getAllTableNames();
//                 return { tables: tableNames };
//             }
//         },
        
//         // ✅ NEW: Get columns for a specific table
//         columns: {
//             type: columnType,
//             description: 'Get columns from a table',
//             args: {
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'income_statement_AAPL_quarterly'
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { tableName } = args;
//                 const columnsName = await getTableColumns({ tableName });
//                 return { columns: columnsName };
//             }
//         },

//         getAllData: {
//             type: new GraphQLList(allDataType),
//             description: 'Get all the data about a company',
//             args: {
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED
//                 }
//             },
//             resolve: async (_, args) => {
//                 const {tableName} = args;
//                 const getAllCompData = await create_sql_query({tableName});
//                 return getAllCompData.map(row => ({data: row}));
//             }
//         }
//     })
// })


// module.exports = new GraphQLSchema({
//     query: RootQuery
// })

// /* ===== EXAMPLE QUERIES FOR TESTING =====

// // 1. Get all tables
// {
//   tables {
//     tables
//   }
// }

// // 2. Get columns for a table
// {
//   columns(tableName: "income_statement_AAPL_quarterly") {
//     columns
//   }
// }

// // 3. Get financial data (MAIN QUERY USED BY FRONTEND)
// {
//   customQuery(
//     tableName: "income_statement_AAPL_quarterly"
//     columns: ["symbol", "fiscalDateEnding", "totalRevenue", "netIncome", "grossProfit", "operatingExpenses", "ebitda"]
//     limit: "8"
//   ) {
//     data
//   }
// }

// // 4. Compare companies
// {
//   compareCompanies(
//     companies: ["AAPL", "MNDY", "ENPH"]
//     period: "annual"
//     columns: ["symbol", "fiscalDateEnding", "totalRevenue", "netIncome"]
//   ) {
//     data
//   }
// }

// // 5. Get all data for a company
// {
//   getAllData(tableName: "income_statement_SEDG_quarterly") {
//     data
//   }
// }

// */



//--new
//to start the code type in terminal >>>> npm run devStart
//to kill the process id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
const { graphqlHTTP } = require('express-graphql');
const graphql = require('graphql');
const { 
    getTableColumns, 
    getAllTableNames, 
    getDataByQuery, 
    create_sql_query, 
    addCompanyToDatabase,
    searchCompanies,        // ✅ NEW
    getCompanyName,         // ✅ NEW
    getCompanyNamesBatch    // ✅ NEW
} = require('../models/sqlQuery');

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLScalarType,
    GraphQLBoolean
} = require('graphql');


const tableType = new GraphQLObjectType({
    name: 'Tables',
    description: 'Get Tables to filter',
    fields: () => ({
        tables: { type: GraphQLList(GraphQLString) }
    })
});

const columnType = new GraphQLObjectType({
    name: 'Columns',
    description: 'Get columns to filter',
    fields: () => ({
        columns: { type: GraphQLList(GraphQLString) }
    })
});

const GenericScalar = new GraphQLScalarType({
    name: 'GenericScalar',
    description: 'A generic scalar that can handle various data types',
    serialize(value) {
        return value;
    }
});

const freeStyleType = new GraphQLObjectType({
    name: 'FreeStyleType',
    fields: () => ({
        data: { type: GenericScalar }
    })
});

const allDataType = new GraphQLObjectType({
    name: 'AllDataOfCompany',
    fields: () => ({
        data: { type: GenericScalar }
    })
});

const addCompanyResultType = new GraphQLObjectType({
    name: 'AddCompanyResult',
    description: 'Result of adding a new company',
    fields: () => ({
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        symbol: { type: GraphQLString },
        annualCount: { type: GraphQLInt },
        quarterlyCount: { type: GraphQLInt }
    })
});

// ✅ NEW: Company search result type
const companySearchResultType = new GraphQLObjectType({
    name: 'CompanySearchResult',
    description: 'Individual search result from Alpha Vantage',
    fields: () => ({
        symbol: { type: GraphQLString },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        region: { type: GraphQLString },
        currency: { type: GraphQLString }
    })
});

// ✅ NEW: Search response type
const searchCompaniesResultType = new GraphQLObjectType({
    name: 'SearchCompaniesResult',
    description: 'Result of company search',
    fields: () => ({
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        results: { type: GraphQLList(companySearchResultType) }
    })
});

// ✅ NEW: Company name type
const companyNameResultType = new GraphQLObjectType({
    name: 'CompanyNameResult',
    description: 'Company name result',
    fields: () => ({
        success: { type: GraphQLBoolean },
        symbol: { type: GraphQLString },
        name: { type: GraphQLString },
        message: { type: GraphQLString }
    })
});

// ✅ NEW: Batch company names type
const batchCompanyNamesResultType = new GraphQLObjectType({
    name: 'BatchCompanyNamesResult',
    description: 'Batch company names result',
    fields: () => ({
        success: { type: GraphQLBoolean },
        companies: { type: GraphQLList(companyNameResultType) }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root Query - collect all the query for db.',
    fields: () => ({
        tableColumns: {
            type: columnType,
            description: 'Get all columns from table',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'income_statement_AAPL_quarterly'
                }
            },
            resolve: async (_, args) => {
                const { tableName } = args;
                const columnsName = await getTableColumns({tableName});
                return { columns: columnsName };
            }
        },
        dbTables: {
            type: tableType,
            description: 'Get all table from db',
            resolve: async (_, args) => {
                const tableNames = await getAllTableNames();
                return { tables: tableNames };
            }
        },
        
        customQuery: {
            type: new GraphQLList(freeStyleType),
            description: 'Get data with custom column selection - MAIN QUERY FOR FRONTEND',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'income_statement_AAPL_quarterly'
                },
                columns: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['fiscalDateEnding', 'totalRevenue']
                },
                limit: {
                    type: GraphQLString,
                    description: 'Number of records to return'
                }
            },
            resolve: async (_, args) => {
                const { tableName, columns, limit } = args;
                
                let query = `SELECT ${columns.join(', ')} FROM ${tableName}`;
                if (limit) {
                    query += ` LIMIT ${limit}`;
                }
                
                const dataByQuery = await getDataByQuery(query);
                return dataByQuery.map(row => ({ data: row }));
            }
        },
        
        compareCompanies: {
            type: new GraphQLList(freeStyleType),
            description: 'Compare metrics across multiple companies',
            args: {
                companies: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['AAPL', 'ENPH']
                },
                period: {
                    type: GraphQLString,
                    defaultValue: 'annual'
                },
                columns: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['symbol', 'fiscalDateEnding', 'totalRevenue', 'netIncome']
                }
            },
            resolve: async (_, args) => {
                const { companies, period, columns } = args;
                let allData = [];
                
                for (const company of companies) {
                    const tableName = `income_statement_${company}_${period}`;
                    const query = `SELECT ${columns.join(', ')} FROM ${tableName} LIMIT 5`;
                    
                    try {
                        const data = await getDataByQuery(query);
                        allData = allData.concat(data);
                    } catch (error) {
                        console.error(`Error fetching data for ${company}:`, error);
                    }
                }
                
                return allData.map(row => ({ data: row }));
            }
        },
        
        tables: {
            type: tableType,
            description: 'Get all available tables',
            resolve: async () => {
                const tableNames = await getAllTableNames();
                return { tables: tableNames };
            }
        },
        
        columns: {
            type: columnType,
            description: 'Get columns from a table',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'income_statement_AAPL_quarterly'
                }
            },
            resolve: async (_, args) => {
                const { tableName } = args;
                const columnsName = await getTableColumns({ tableName });
                return { columns: columnsName };
            }
        },

        getAllData: {
            type: new GraphQLList(allDataType),
            description: 'Get all the data about a company',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'income_statement_AAPL_quarterly'
                }
            },
            resolve: async (_, args) => {
                const {tableName} = args;
                const getAllCompData = await create_sql_query({tableName});
                return getAllCompData.map(row => ({data: row}));
            }
        },

        // ✅ NEW: Search companies query
        searchCompanies: {
            type: searchCompaniesResultType,
            description: 'Search for companies using Alpha Vantage API',
            args: {
                keywords: {
                    type: GraphQLString,
                    description: 'Search keywords (company name or ticker)'
                }
            },
            resolve: async (_, args) => {
                const { keywords } = args;
                console.log(`🔍 GraphQL Query: searchCompanies with keywords: ${keywords}`);
                return await searchCompanies(keywords);
            }
        },

        // ✅ NEW: Get company name query
        getCompanyName: {
            type: companyNameResultType,
            description: 'Get company name for a ticker symbol',
            args: {
                symbol: {
                    type: GraphQLString,
                    description: 'Stock ticker symbol'
                }
            },
            resolve: async (_, args) => {
                const { symbol } = args;
                console.log(`📝 GraphQL Query: getCompanyName for ${symbol}`);
                return await getCompanyName(symbol);
            }
        },

        // ✅ NEW: Get multiple company names (batch)
        getCompanyNamesBatch: {
            type: batchCompanyNamesResultType,
            description: 'Get company names for multiple symbols',
            args: {
                symbols: {
                    type: GraphQLList(GraphQLString),
                    description: 'List of stock ticker symbols'
                }
            },
            resolve: async (_, args) => {
                const { symbols } = args;
                console.log(`📝 GraphQL Query: getCompanyNamesBatch for ${symbols.length} symbols`);
                return await getCompanyNamesBatch(symbols);
            }
        }
    })
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    description: 'Root Mutation - all mutations for modifying data',
    fields: () => ({
        addCompany: {
            type: addCompanyResultType,
            description: 'Add a new company to the database by fetching from Alpha Vantage API',
            args: {
                symbol: {
                    type: GraphQLString,
                    description: 'Stock symbol (e.g., AAPL, TSLA, NVDA)'
                }
            },
            resolve: async (_, args) => {
                const { symbol } = args;
                
                try {
                    console.log(`🔍 Mutation called: addCompany for ${symbol}`);
                    const result = await addCompanyToDatabase(symbol);
                    return result;
                } catch (error) {
                    console.error('❌ Error in addCompany mutation:', error);
                    return {
                        success: false,
                        message: error.message || 'Failed to add company',
                        symbol: symbol,
                        annualCount: 0,
                        quarterlyCount: 0
                    };
                }
            }
        }
    })
});


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});

/* ===== EXAMPLE QUERIES FOR TESTING =====

// 1. Search for companies
{
  searchCompanies(keywords: "Apple") {
    success
    message
    results {
      symbol
      name
      type
      region
      currency
    }
  }
}

// 2. Get company name
{
  getCompanyName(symbol: "AAPL") {
    success
    symbol
    name
    message
  }
}

// 3. Get multiple company names
{
  getCompanyNamesBatch(symbols: ["AAPL", "MSFT", "NVDA"]) {
    success
    companies {
      symbol
      name
      success
    }
  }
}

// 4. Add a company (MUTATION)
mutation {
  addCompany(symbol: "TSLA") {
    success
    message
    symbol
    annualCount
    quarterlyCount
  }
}

// 5. Get all tables
{
  tables {
    tables
  }
}

// 6. Get financial data
{
  customQuery(
    tableName: "income_statement_AAPL_quarterly"
    columns: ["symbol", "fiscalDateEnding", "totalRevenue", "netIncome"]
    limit: "8"
  ) {
    data
  }
}

*/