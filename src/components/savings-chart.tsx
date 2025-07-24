"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Savings",
  },
  time: {
    label: "Time Savings",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "Hiring Cost Savings",
    color: "hsl(var(--chart-2))",
  },
  turnover: {
    label: "Turnover Reduction",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function SavingsChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  
  const formatCurrency = (value: number) => {
    if (value === 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
          layout="vertical"
        >
          <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
          <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={130} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value) => formatCurrency(Number(value))}
                labelClassName="font-bold" 
            />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
