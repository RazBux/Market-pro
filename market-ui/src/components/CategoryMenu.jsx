// import React, { useState } from "react";
// import { useQuery } from "@apollo/client";
// import gql from "graphql-tag";
// import MySelect from "./MySelect";
// import { useDarkModeContext } from "../contexts/DarkModeContext";

// const GET_CATEGORIES = gql`
//   query GetCategories($tableName: String!) {
//     tableColumns(tableName: $tableName) {
//       columns
//     }
//   }
// `;

// function labelize(col) {
//   return String(col).replaceAll("_", " ");
// }

// export default function CategoryMenu({ selectedTable, updateCategories }) {
//   const { darkTheme } = useDarkModeContext();

//   const { loading, error, data } = useQuery(GET_CATEGORIES, {
//     variables: { tableName: selectedTable },
//     skip: !selectedTable,
//   });

//   const [selectedOptions, setSelectedOptions] = useState([]);

//   if (loading) return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;
//   if (error) return <p className="text-red-600">Error: {error.message}</p>;

//   const options =
//     data?.tableColumns?.columns
//       ?.filter((c) => c !== "quarter")
//       .map((c) => ({ label: labelize(c), value: c })) || [];

//   const handleCategoryChange = (opts) => {
//     setSelectedOptions(opts || []);
//     // IMPORTANT: update immediately (no need submit)
//     const categories = (opts || []).map((o) => o.value);
//     updateCategories(categories);
//   };

//   return (
//     <div className="max-w-xl">
//       <h1 className="font-extrabold text-xl mb-2 text-gray-800 dark:text-gray-100">
//         Categories
//       </h1>

//       <MySelect
//         isMulti={true}
//         options={options}
//         value={selectedOptions}
//         handleChange={handleCategoryChange}
//         darkMode={darkTheme}
//         closeMenuOnSelect={true}   // ✅ (4) close after each selection
//       />

//       <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//         Tip: select multiple metrics. Menu closes after each click (reopen to add more).
//       </p>
//     </div>
//   );
// }



import React, { useMemo } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import MySelect from "./MySelect";
import { useDarkModeContext } from "../contexts/DarkModeContext";

const GET_CATEGORIES = gql`
  query GetCategories($tableName: String!) {
    tableColumns(tableName: $tableName) {
      columns
    }
  }
`;

function labelize(col) {
  return String(col).replaceAll("_", " ");
}

export default function CategoryMenu({ selectedTable, updateCategories, selectedCategories }) {
  const { darkTheme } = useDarkModeContext();

  const { loading, error, data } = useQuery(GET_CATEGORIES, {
    variables: { tableName: selectedTable },
    skip: !selectedTable,
  });

  const options = useMemo(() => {
    const cols = data?.tableColumns?.columns || [];
    return cols
      .filter((c) => c !== "quarter")
      .map((c) => ({ label: labelize(c), value: c }));
  }, [data]);

  // Controlled select value from selectedCategories (so bundles/clear update UI)
  const value = useMemo(() => {
    const set = new Set(selectedCategories || []);
    return options.filter((o) => set.has(o.value));
  }, [options, selectedCategories]);

  if (loading) return <p className="text-gray-500 dark:text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const handleCategoryChange = (opts) => {
    const categories = (opts || []).map((o) => o.value);
    updateCategories(categories);
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-extrabold text-xl mb-2 text-gray-800 dark:text-gray-100">
        Categories
      </h1>

      <MySelect
        isMulti={true}
        options={options}
        value={value}
        handleChange={handleCategoryChange}
        darkMode={darkTheme}
        closeMenuOnSelect={false}   // ✅ stays open
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Select multiple metrics. Menu stays open.
      </p>
    </div>
  );
}
