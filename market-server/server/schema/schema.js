//to start the code type in terminal >>>> npm run devStart
//to kill the prosess id - find it with "lsof -i :8000" and kill it with "kill -9 <PID>"
const { graphqlHTTP } = require('express-graphql'); // Use graphqlHTTP for middleware
const graphql = require('graphql');
const { getTableColumns ,getAllTableNames ,getDataByQuery } = require('../models/sqlQuery')

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat
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

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    description: 'Root Query - collect all the query for db.',
    fields: () => ({
        tableColumns: {
            type: columnType,
            description: 'Get all columns from table',
            resolve: async (_, args) => {
                // Execute the query using async/await
                const columnsName = await getTableColumns('tesla');
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
        revenue: {
            type: new GraphQLList(revenueType),
            description: 'Get data on total revnue',
            args: {
                // Define the SQL query argument as a GraphQL String
                sqlQuery: {
                    type: GraphQLString,
                    defaultValue: "SELECT quarter, total_revenues FROM tesla;" //"total_revenue and quarter" need to be same in all tables and databases.
                },
            },
            resolve: async (_, args) => {
                const { sqlQuery } = args;
                const dataByQuery = await getDataByQuery(sqlQuery);
                return dataByQuery;
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
