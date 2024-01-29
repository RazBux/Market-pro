import React from 'react';
import { useTable } from 'react-table';
import { useQuery, gql } from '@apollo/client';

const GET_TABLE_DATA = gql`
  query GetTableData($tableName: String!) {
    getAllData(tableName: $tableName) {
      data
    }
  }
`;

const DataTable = ({ tableName }) => {
    const { data, loading, error } = useQuery(GET_TABLE_DATA, {
        variables: { tableName: tableName },
        skip: !tableName,
    });
    console.log(data);
    const columns = React.useMemo(() => {
        // Check if the data and the 'data' property inside it exist
        if (!data || !data.getAllData || !Array.isArray(data.getAllData) || data.getAllData.length === 0) {
            return [];
        }
        // Assuming each item in getAllData array has a 'data' property which is the object we need
        const sampleItem = data.getAllData[0].data;
        return Object.keys(sampleItem).map(key => ({
            Header: key.charAt(0).toUpperCase() + key.slice(1),
            accessor: `data.${key}`, // Updated accessor to target the nested 'data' object
        }));
    }, [data]);

    // Use the useTable Hook to send the columns and data to build the table
    const tableInstance = useTable({ columns, data: data?.getAllData || [] });

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error! {error.message}</div>;

    return (
        <div>
            <div>
                <br />
                <hr/>
                <h3>{tableName.toUpperCase()} DATA:</h3>
            </div>
            <div className="table-container">
                <table {...getTableProps()} calssName="no-select">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
