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

    const columns = React.useMemo(() => {
        if (!data || !data.getAllData || !Array.isArray(data.getAllData) || data.getAllData.length === 0) {
            return [];
        }

        const sampleItem = data.getAllData[0].data;
        return Object.keys(sampleItem).map(key => ({
            Header: key.charAt(0).toUpperCase() + key.slice(1),
            accessor: `data.${key}`,
        }));
    }, [data]);

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
                <hr className="w-70 mx-auto border-0 h-1 bg-gray-600 shadow-md dark:bg-gray-900" />
                <h3 className="dark:text-white">{tableName.toUpperCase()} DATA:</h3>
            </div>
            <div className="overflow-x-auto">
                <table {...getTableProps()} className="table-auto w-full min-w-max border-collapse">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()} className="p-2 text-left border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className="border-t border-gray-300 dark:border-gray-700">
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()} className="p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
                                            {cell.render('Cell')}
                                        </td>
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

