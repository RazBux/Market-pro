// //to start the code type in terminal >>>> npm run devStart
// //to kill the prosess id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
// const { graphqlHTTP } = require('express-graphql'); // Use graphqlHTTP for middleware
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
//     description: 'Get Tables to fillter',
//     fields: () => ({
//         tables: { type: GraphQLList(GraphQLString) }
//     })
// });

// const columnType = new GraphQLObjectType({
//     name: 'Columns',
//     description: 'Get columns to fillter',
//     fields: () => ({
//         columns: { type: GraphQLList(GraphQLString) }
//     })
// });

// const revenueType = new GraphQLObjectType({
//     name: 'Revene',
//     description: 'Get revene by quarter',
//     fields: () => ({
//         //those name need to be as in the query!
//         quarter: { type: GraphQLFloat },
//         total_revenues: { type: GraphQLString }
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
//                     defaultValue: 'tesla'
//                 }
//             },
//             resolve: async (_, args) => {
//                 // Execute the query using async/await
//                 const { tableName } = args;
//                 const columnsName = await getTableColumns({tableName});
//                 return { columns: columnsName };
//             }
//         },
//         dbTables: {
//             type: tableType,
//             description: 'Get all table from db',
//             resolve: async (_, args) => {
//                 // Execute the query using async/await
//                 const tableNames = await getAllTableNames();
//                 return { tables: tableNames };
//             }
//         },
//         //remove this from the graph
//         revenue: {
//             type: new GraphQLList(revenueType),
//             description: 'Get data with sql query',
//             args: {
//                 // Define the SQL query argument as a GraphQL String
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'tesla' //"total_revenue and quarter" need to be same in all tables and databases.
//                 },
//                 columnList: {
//                     type: GraphQLList(GraphQLString),
//                     defaultValue: ['quarter', 'total_revenues']
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { tableName, columnList } = args;
//                 const dataByQuery = await create_sql_query({ tableName, columnList });
//                 console.log(dataByQuery);
//                 return dataByQuery;
//             }
//         },
//         getFreeStyleData: {
//             type: new GraphQLList(freeStyleType),
//             description: 'Get data with sql query free style',
//             args: {
//                 // Define the SQL query argument as a GraphQL String
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'tesla' //"total_revenue and quarter" need to be same in all tables and databases.
//                 },
//                 columnList: {
//                     type: GraphQLList(GraphQLString),
//                     defaultValue: ['quarter', 'total_revenues']
//                 }
//             },
//             resolve: async (_, args) => {
//                 const { tableName, columnList } = args;
//                 const dataByQuery = await create_sql_query({ tableName, columnList });
//                 // console.log(`${dataByQuery.map(row => ({ data: row }))}`);

//                 // Format the data for the dynamic type
//                 return dataByQuery.map(row => ({ data: row }));
//             }
//         },
//         getAllData: {
//             type: new GraphQLList(allDataType),
//             description: 'Get all the data about a company',
//             args: {
//                 tableName: {
//                     type: GraphQLString,
//                     defaultValue: 'tesla'
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

// // //--all column name from table.
// // PRAGMA table_info(tesla);

// // //--all table name.
// // SELECT name FROM sqlite_master WHERE type='table';

// // the query is legal in here: 
// // query{
// //     revenue(sqlQuery: "SELECT quarter, total_revenues FROM tesla where quarter=2021.1;"){
// //       total_revenues,
// //       quarter
// //     }
// //   }
// // and also as this:
// // query{
// //     revenue{
// //       quarter,
// //       total_revenues
// //     },
// //   }
// //and also as this:
// // {
// //     getFreeStyleData(columnList: ["quarter", "total_revenues",
// //            "operating_expenses", "free_cash_flow", "total_gross_profit"]){
// //       quarter,
// //       total_revenues,
// //       total_gross_profit,
// //       operating_expenses,
// //       free_cash_flow
// //     }
// //   }

// -----------

//to start the code type in terminal >>>> npm run devStart
//to kill the process id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
const { graphqlHTTP } = require('express-graphql');
const graphql = require('graphql');
const { getTableColumns, getAllTableNames, getDataByQuery, create_sql_query } = require('../models/sqlQuery')

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLScalarType
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

// Define a generic scalar type
const GenericScalar = new GraphQLScalarType({
    name: 'GenericScalar',
    description: 'A generic scalar that can handle various data types',
    serialize(value) {
        return value; // return the value as is
    }
});

// Define a dynamic GraphQL object type using the generic scalar
const freeStyleType = new GraphQLObjectType({
    name: 'FreeStyleType',
    fields: () => ({
        data: { type: GenericScalar }
    })
});

// Define a dynamic GraphQL object type using the generic scalar
const allDataType = new GraphQLObjectType({
    name: 'AllDataOfCompany',
    fields: () => ({
        data: { type: GenericScalar }
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
                    defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED: Updated from 'tesla'
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
        
        // ✅ NEW: Query that matches what the frontend expects
        customQuery: {
            type: new GraphQLList(freeStyleType),
            description: 'Get data with custom column selection - MAIN QUERY FOR FRONTEND',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED
                },
                columns: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['fiscalDateEnding', 'totalRevenue'] // ✅ CHANGED
                },
                limit: {
                    type: GraphQLString,
                    description: 'Number of records to return'
                }
            },
            resolve: async (_, args) => {
                const { tableName, columns, limit } = args;
                
                // Build query with optional LIMIT
                let query = `SELECT ${columns.join(', ')} FROM ${tableName}`;
                if (limit) {
                    query += ` LIMIT ${limit}`;
                }
                
                const dataByQuery = await getDataByQuery(query);
                
                // Format the data for the dynamic type
                return dataByQuery.map(row => ({ data: row }));
            }
        },
        
        // ✅ NEW: Company comparison query
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
        
        // ✅ NEW: Get all tables (for frontend to list companies)
        tables: {
            type: tableType,
            description: 'Get all available tables',
            resolve: async () => {
                const tableNames = await getAllTableNames();
                return { tables: tableNames };
            }
        },
        
        // ✅ NEW: Get columns for a specific table
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
                    defaultValue: 'income_statement_AAPL_quarterly' // ✅ CHANGED
                }
            },
            resolve: async (_, args) => {
                const {tableName} = args;
                const getAllCompData = await create_sql_query({tableName});
                return getAllCompData.map(row => ({data: row}));
            }
        }
    })
})


module.exports = new GraphQLSchema({
    query: RootQuery
})

/* ===== EXAMPLE QUERIES FOR TESTING =====

// 1. Get all tables
{
  tables {
    tables
  }
}

// 2. Get columns for a table
{
  columns(tableName: "income_statement_AAPL_quarterly") {
    columns
  }
}

// 3. Get financial data (MAIN QUERY USED BY FRONTEND)
{
  customQuery(
    tableName: "income_statement_AAPL_quarterly"
    columns: ["symbol", "fiscalDateEnding", "totalRevenue", "netIncome", "grossProfit", "operatingExpenses", "ebitda"]
    limit: "8"
  ) {
    data
  }
}

// 4. Compare companies
{
  compareCompanies(
    companies: ["AAPL", "MNDY", "ENPH"]
    period: "annual"
    columns: ["symbol", "fiscalDateEnding", "totalRevenue", "netIncome"]
  ) {
    data
  }
}

// 5. Get all data for a company
{
  getAllData(tableName: "income_statement_SEDG_quarterly") {
    data
  }
}

*/