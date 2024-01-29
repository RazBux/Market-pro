//to start the code type in terminal >>>> npm run devStart
//to kill the prosess id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
const { graphqlHTTP } = require('express-graphql'); // Use graphqlHTTP for middleware
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
    description: 'Get Tables to fillter',
    fields: () => ({
        tables: { type: GraphQLList(GraphQLString) }
    })
});

const columnType = new GraphQLObjectType({
    name: 'Columns',
    description: 'Get columns to fillter',
    fields: () => ({
        columns: { type: GraphQLList(GraphQLString) }
    })
});

const revenueType = new GraphQLObjectType({
    name: 'Revene',
    description: 'Get revene by quarter',
    fields: () => ({
        //those name need to be as in the query!
        quarter: { type: GraphQLFloat },
        total_revenues: { type: GraphQLString }
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
                    defaultValue: 'tesla'
                }
            },
            resolve: async (_, args) => {
                // Execute the query using async/await
                const { tableName } = args;
                const columnsName = await getTableColumns({tableName});
                return { columns: columnsName };
            }
        },
        dbTables: {
            type: tableType,
            description: 'Get all table from db',
            resolve: async (_, args) => {
                // Execute the query using async/await
                const tableNames = await getAllTableNames();
                return { tables: tableNames };
            }
        },
        //remove this from the graph
        revenue: {
            type: new GraphQLList(revenueType),
            description: 'Get data with sql query',
            args: {
                // Define the SQL query argument as a GraphQL String
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'tesla' //"total_revenue and quarter" need to be same in all tables and databases.
                },
                columnList: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['quarter', 'total_revenues']
                }
            },
            resolve: async (_, args) => {
                const { tableName, columnList } = args;
                const dataByQuery = await create_sql_query({ tableName, columnList });
                console.log(dataByQuery);
                return dataByQuery;
            }
        },
        getFreeStyleData: {
            type: new GraphQLList(freeStyleType),
            description: 'Get data with sql query free style',
            args: {
                // Define the SQL query argument as a GraphQL String
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'tesla' //"total_revenue and quarter" need to be same in all tables and databases.
                },
                columnList: {
                    type: GraphQLList(GraphQLString),
                    defaultValue: ['quarter', 'total_revenues']
                }
            },
            resolve: async (_, args) => {
                const { tableName, columnList } = args;
                const dataByQuery = await create_sql_query({ tableName, columnList });
                // console.log(`${dataByQuery.map(row => ({ data: row }))}`);

                // Format the data for the dynamic type
                return dataByQuery.map(row => ({ data: row }));
            }
        },
        getAllData: {
            type: new GraphQLList(allDataType),
            description: 'Get all the data about a company',
            args: {
                tableName: {
                    type: GraphQLString,
                    defaultValue: 'tesla'
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

// //--all column name from table.
// PRAGMA table_info(tesla);

// //--all table name.
// SELECT name FROM sqlite_master WHERE type='table';

// the query is legal in here: 
// query{
//     revenue(sqlQuery: "SELECT quarter, total_revenues FROM tesla where quarter=2021.1;"){
//       total_revenues,
//       quarter
//     }
//   }
// and also as this:
// query{
//     revenue{
//       quarter,
//       total_revenues
//     },
//   }
//and also as this:
// {
//     getFreeStyleData(columnList: ["quarter", "total_revenues",
//            "operating_expenses", "free_cash_flow", "total_gross_profit"]){
//       quarter,
//       total_revenues,
//       total_gross_profit,
//       operating_expenses,
//       free_cash_flow
//     }
//   }