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

const freeStyleType = new GraphQLObjectType({
    name: 'resiveDataByFreeStyle',
    fields: () => ({
      quarter: { type: GraphQLFloat },
      automotive_revenues: { type: GraphQLString },
      total_revenues: { type: GraphQLString },
      total_gross_profit: { type: GraphQLString },
      total_gaap_gross_margin: { type: GraphQLString },
      operating_expenses: { type: GraphQLString },
      income_from_operations: { type: GraphQLString },
      operating_margin: { type: GraphQLString },
      net_cash_provided_by_operating_activities: { type: GraphQLString },
      capital_expenditures: { type: GraphQLString },
      adjusted_ebitda: { type: GraphQLString },
      adjusted_ebitda_margin: { type: GraphQLString },
      net_income_attributable_to_common_stockholders_gaap: { type: GraphQLString },
      net_income_attributable_to_common_stockholders_non_gaap: { type: GraphQLString },
      free_cash_flow: { type: GraphQLString },
      eps_attributable_to_common_stockholders_diluted_gaap_1: { type: GraphQLString },
      eps_attributable_to_common_stockholders_diluted_non_gaap_1: { type: GraphQLString },
      energy_generation_and_storage_revenue: { type: GraphQLString },
      services_and_other_revenue: { type: GraphQLString },
      cash_cash_equivalents_and_investments: { type: GraphQLString },
      of_which_regulatory_credits: { type: GraphQLString },
      automotive_gross_profit: { type: GraphQLString },
      automotive_gross_margin: { type: GraphQLString },
      cash_and_cash_equivalents: { type: GraphQLString },
      eps_attributable_to_common_stockholders_basic_gaap: { type: GraphQLString },
      eps_attributable_to_common_stockholders_basic_non_gaap: { type: GraphQLString },
      ebitda: { type: GraphQLString },
      ebitda_margin: { type: GraphQLString },
      net_income_loss_attributable_to_common_stockholders_gaap: { type: GraphQLString },
      net_income_loss_attributable_to_common_stockholders_non_gaap: { type: GraphQLString },
      operating_cash_flow_less_capital_expenditures: { type: GraphQLString },
    }),
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
                const dataByQuery = await create_sql_query({tableName, columnList});
                console.log (dataByQuery);
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
                const dataByQuery = await create_sql_query({tableName, columnList});
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