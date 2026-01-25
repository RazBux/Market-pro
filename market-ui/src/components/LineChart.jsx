
import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDarkModeContext } from "../contexts/DarkModeContext";

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#387908",
  "#ff0000",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
];

const processData = (data) => {
  let groupedData = {};
  let uniqueQuarters = new Set();

  const arr = Array.isArray(data) ? data : data?.data || [];

  if (arr && arr.length > 0) {
    groupedData = arr.reduce((acc, item) => {
      const val = item.data || item;
      if (!val) return acc;

      Object.keys(val).forEach((category) => {
        if (category !== "quarter" && category !== "__typename") {
          let rawValue = val[category];

          if (rawValue !== null && rawValue !== undefined) {
            let yValue;

            if (typeof rawValue === "string") {
              let s = rawValue.trim();
              if (s.startsWith("(") && s.endsWith(")")) s = "-" + s.slice(1, -1);
              s = s.replace(/,/g, "");
              if (s.endsWith("%")) s = s.slice(0, -1);
              yValue = parseFloat(s);
            } else {
              yValue = Number(rawValue);
            }

            if (!Number.isNaN(yValue)) {
              const quarter = val.quarter;
              if (!acc[quarter]) acc[quarter] = { name: quarter };
              acc[quarter][category] = yValue;
              uniqueQuarters.add(quarter);
            }
          }
        }
      });

      return acc;
    }, {});
  }

  return Array.from(uniqueQuarters)
    .sort()
    .map((q) => groupedData[q]);
};

const formatYAxis = (value) => `$${(value / 1000).toLocaleString()}k`;

function useIsMobile(breakpointPx = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);

  return isMobile;
}

export default function LineChartComponent({ data, selectedTable }) {
  const { darkTheme } = useDarkModeContext();
  const isMobile = useIsMobile(640);

  const processedData = useMemo(() => processData(data), [data]);
  const categories = useMemo(
    () => Object.keys(processedData[0] || {}).filter((k) => k !== "name"),
    [processedData]
  );

  // theme styles
  const gridStroke = darkTheme ? "#374151" : "#e5e7eb";
  const axisTickFill = darkTheme ? "#e5e7eb" : "#374151";
  const tooltipBg = darkTheme ? "#111827" : "#ffffff";
  const tooltipBorder = darkTheme ? "#374151" : "#e5e7eb";
  const tooltipText = darkTheme ? "#e5e7eb" : "#111827";

  // mobile adjustments
  const chartHeight = isMobile ? 360 : 520;
  const xInterval = isMobile ? "preserveStartEnd" : 2; // fewer labels on mobile
  const xTickFont = isMobile ? 10 : 12;
  const yTickFont = isMobile ? 10 : 12;
  const yWidth = isMobile ? 62 : 85;

  const margin = isMobile
    ? { top: 0, right: 0, left: 0, bottom: 0 }
    : { top: 10, right:19, left: -35, bottom: 10 };

  // legend: better on mobile at bottom, centered
  const legendProps = isMobile
    ? {
        verticalAlign: "bottom",
        align: "center",
        wrapperStyle: { paddingTop: 8, color: axisTickFill, fontSize: 11 },
      }
    : {
        verticalAlign: "top",
        align: "right",
        wrapperStyle: { color: axisTickFill },
      };

  return (
    <div className="">
      {/* logo smaller on mobile */}
      <div className="flex items-center justify-center mb-1">
        <img
          src={`/assets/logo/${selectedTable}.svg`}
          alt={`${selectedTable} logo`}
          className={isMobile ? "w-24 h-auto" : "w-28 h-auto"}
        />
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <ReLineChart data={processedData} margin={margin}>
          <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />

          <XAxis
            dataKey="name"
            tick={{ fill: axisTickFill, fontSize: xTickFont }}
            tickMargin={8}
            interval={xInterval}
            minTickGap={isMobile ? 18 : 10}
          />

          <YAxis
            width={yWidth}
            tick={{ fill: axisTickFill, fontSize: yTickFont }}
            tickFormatter={formatYAxis}
            tickMargin={8}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              color: tooltipText,
              borderRadius: 12,
            }}
            labelStyle={{ color: tooltipText, fontSize: isMobile ? 12 : 13 }}
            itemStyle={{ color: tooltipText, fontSize: isMobile ? 12 : 13 }}
            formatter={(value) => `$${Number(value).toLocaleString()}`}
          />

          <Legend {...legendProps} />

          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category.replaceAll("_", " ")}
              stroke={colors[index % colors.length]}
              dot={false}
              strokeWidth={isMobile ? 2 : 2.5}
              isAnimationActive={!isMobile} // smoother on desktop, faster on mobile
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
