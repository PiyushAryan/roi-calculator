"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SavingsChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
}

export default function SavingsChart({ data }: SavingsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const chartConfig = {
    value: {
      label: "Value",
    },
    current: {
      label: "Current Cost",
      color: "hsl(var(--chart-1))",
    },
    new: {
      label: "With Intervue.io",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${Number(value) / 1000}k`}
          />
          <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                  formatter={(value) => formatCurrency(value as number)}
                  indicator="dot" 
              />}
          />
          <Bar dataKey="value" radius={4}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  )
}
