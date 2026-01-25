import React, { useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";

import ToolBar from "./ToolBar";
import CategoryMenu from "./CategoryMenu";
import LineChart from "./LineChart";
import DataTable from "./DataTable";
import { useDarkModeContext } from '../contexts/DarkModeContext';
import DarkModeIcon from "../contexts/DarkModeIcon";


const DEFAULT_QUERY = gql`
  query GetFreeStyleData($tableName: String!) {
    getFreeStyleData(tableName: $tableName, columnList: ["quarter,total_revenues"]) {
      data
    }
  }
`;

function generateGraphQLQuery(selectedTable, categories) {
  const safeCols = ["quarter", ...categories];
  const columns = safeCols.map((c) => `"${c}"`).join(",");

  return gql`
    query {
      getFreeStyleData(tableName: "${selectedTable}", columnList: [${columns}]) {
        data
      }
    }
  `;
}

function formatCategoryLabel(s) {
  if (!s) return "";
  return String(s).replaceAll("_", " ");
}

export default function MarketToolbar() {
  const { darkTheme, setDarkTheme } = useDarkModeContext();

  const [mode, setMode] = useState("chart"); // "chart" | "table"
  const [selectedTable, setSelectedTable] = useState("monday");

  const [selectedCategories, setSelectedCategories] = useState(["total_revenues"]);
  const [chartQuery, setChartQuery] = useState(DEFAULT_QUERY);

  const { loading, error, data } = useQuery(chartQuery, {
    variables: { tableName: selectedTable },
    skip: !selectedTable,
  });

  const toolbarOptions = useMemo(() => ["chart", "table"], []);

  // ✅ Recommended bundles (you can add more anytime)
  const bundles = useMemo(
    () => [
      {
        id: "topline_marketing",
        label: "Revenue + Marketing",
        categories: ["total_revenues", "sales_and_marketing"],
      },
      {
        id: "topline_rnd",
        label: "Revenue + R&D",
        categories: ["total_revenues", "research_and_development"],
      },
      {
        id: "profitability",
        label: "Profitability",
        categories: ["total_revenues", "gross_profit", "net_income_loss"],
      },
      {
        id: "ops",
        label: "Operating view",
        categories: ["total_revenues", "total_operation_expence", "operating_income_loss"],
      },
    ],
    []
  );

  const setCategoriesAndQuery = (categories) => {
    const cleaned = categories?.length ? categories : [];
    setSelectedCategories(cleaned);

    const newQuery = cleaned.length
      ? generateGraphQLQuery(selectedTable, cleaned)
      : DEFAULT_QUERY;

    setChartQuery(newQuery);
  };

  const clearSelections = () => {
    // reset to default state
    setSelectedCategories(["total_revenues"]);
    setChartQuery(DEFAULT_QUERY);
  };

  const applyBundle = (bundleCategories) => {
    setCategoriesAndQuery(bundleCategories);
    setMode("chart");
  };

  const updateSelectedTable = (tableName) => {
    setSelectedTable(tableName);
    // reset chart to default for the new table
    setSelectedCategories(["total_revenues"]);
    setChartQuery(DEFAULT_QUERY);
    setMode("chart");
  };

  const updateCategories = (categories) => {
    setCategoriesAndQuery(categories);
  };

  const chartPayload = data?.getFreeStyleData;

  return (
    <div className="flex flex-col w-full overflow-auto max-w-6xl mx-auto mt-6 px-3 sm:px-0">
      {/* Top: select stock/table */}
      {/* <div className="mb-3">
        <ToolBar updateSelectedTable={updateSelectedTable} selectedTable={selectedTable} />
      </div> */}

      {/* Mode Switch (Chart/Table only) */}
      <div
        className="
          flex flex-col sm:flex-row p-4
          sm:flex-wrap
          items-stretch sm:items-center
          justify-center sm:justify-start
          gap-3
          mb-4 rounded-2xl shadow-sm border
          bg-white dark:bg-gray-900
          dark:border-gray-700
        "
      >
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {toolbarOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setMode(opt)}
              className={`
                px-3 sm:px-5
                py-2 sm:py-3
                rounded-xl
                text-sm sm:text-base
                font-medium
                transition-all duration-200
                ${mode === opt
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                }
              `}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto flex flex-wrap gap-2 items-center">
          {/* <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold">
            Table:
          </span> */}
          <span className="px-2 py-1 rounded-lg bg-gray-50 border text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 text-xs sm:text-sm">
            {selectedTable}
          </span>
        </div>

        <div className="flex items-center">
          <DarkModeIcon darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
        </div>

      </div>

      {/* CONTENT */}
      {mode === "chart" ? (
        <div className="rounded-xl border border-gray-100 shadow-md bg-white dark:bg-gray-900 dark:border-gray-700">
          {/* Chart section */}
          {/* <div className="p-3 sm:p-4">
            {loading && <p className="text-gray-500 italic dark:text-gray-400">Loading…</p>}
            {error && <p className="text-red-600">Error: {error.message}</p>}

            {!loading && !error && (
              <LineChart data={chartPayload} selectedTable={selectedTable} />
            )}
          </div> */}
          {/* Chart section */}
          <div className="p-2 sm:p-3">
            {loading && <p className="text-gray-500 italic dark:text-gray-400">Loading…</p>}
            {error && <p className="text-red-600">Error: {error.message}</p>}

            {!loading && !error && (
              <LineChart data={chartPayload} selectedTable={selectedTable} />
            )}
          </div>

          {/* Categories + Bundles section */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-3 sm:p-4">
            {/* ✅ Bundles */}
            <div className="mb-4">
              <h3 className="font-extrabold text-xl mb-2 text-gray-800 dark:text-gray-100">
                Bundles
              </h3>

              <div className="flex flex-wrap gap-2">
                {bundles.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => applyBundle(b.categories)}
                    className="
                      px-3 py-2 rounded-xl text-sm font-semibold
                      bg-gray-100 text-gray-800 hover:bg-gray-200
                      dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
                      border border-transparent hover:border-gray-300 dark:hover:border-gray-600
                      transition
                    "
                    title={b.categories.join(", ")}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ✅ Category menu (stays open now) */}
            <CategoryMenu
              selectedTable={selectedTable}
              updateCategories={updateCategories}
              selectedCategories={selectedCategories}
            />
            <button
              onClick={clearSelections}
              className="
              mt-1 px-3 py-2 rounded-xl text-sm font-semibold
                      bg-gray-100 text-gray-800 hover:bg-gray-200
                      dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700
                      border border-transparent hover:border-gray-300 dark:hover:border-gray-600
                      transition
            "
              title="Reset categories to default"
            >
              Clear
            </button>

            {/* Selected display */}
            <div className="mt-3">
              <h3 className="pl-1 font-bold text-gray-700 dark:text-gray-200">
                Selected Categories:
              </h3>

              {selectedCategories?.length ? (
                <ul className="pb-1 pl-2 font-serif text-gray-700 dark:text-gray-200">
                  {selectedCategories.map((cat) => (
                    <li key={cat} className="list-disc ml-5">
                      {formatCategoryLabel(cat)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic dark:text-gray-400 pl-1">No categories selected.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 shadow-md bg-white dark:bg-gray-900 dark:border-gray-700 p-0">
          <DataTable tableName={selectedTable} />
        </div>
      )}
    </div>
  );
}