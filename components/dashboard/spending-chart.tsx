"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

interface SpendingData {
  name: string;
  amount: number;
  budgetAmount: number;
  percentage: number;
  color: string;
}

interface SpendingChartProps {
  data: SpendingData[];
  title?: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  title = "Spending by budget",
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: SpendingData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Spent:{" "}
            <span className="font-medium text-gray-900">
              {formatCurrency(data.amount)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Budget:{" "}
            <span className="font-medium text-gray-900">
              {formatCurrency(data.budgetAmount)}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Used:{" "}
            <span className="font-medium text-gray-900">
              {data.percentage.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({
    payload,
  }: {
    payload?: Array<{ value: string; color: string }>;
  }) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload?.map(
          (entry: { value: string; color: string }, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 font-nunito">
                {entry.value}
              </span>
            </div>
          )
        )}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 font-nunito">
          {title}
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 font-nunito">
            No spending data available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-nunito">
        {title}
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#0055FF"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget utilization list */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color || "#0055FF" }}
              />
              <span className="text-sm font-medium text-gray-900 font-nunito">
                {item.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 font-nunito">
                {formatCurrency(item.amount)}
              </p>
              <p className="text-xs text-gray-500 font-nunito">
                {item.percentage.toFixed(1)}% of budget
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SpendingChart;
