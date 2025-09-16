"use client"

import { TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { CHART_SERIES_COLORS } from '@/lib/chartColors'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StaffProductivityPieChartProps {
  totalSigned: number;
  totalUnsigned: number;
  overallSigningRate: number;
}

export function StaffProductivityPieChart({ totalSigned, totalUnsigned, overallSigningRate }: StaffProductivityPieChartProps) {
  const chartData = [
    { name: 'Signed Reports', value: totalSigned },
    { name: 'Unsigned Reports', value: totalUnsigned }
  ];

  return (
    <Card 
      className="flex flex-col"
      style={{ 
        border: "1px solid #D7D9D9", 
        borderRadius: "12px", 
        padding: "20px", 
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)" 
      }}
    >
      <CardHeader className="p-0 mb-4">
        <CardTitle style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
          Staff Productivity: Signed vs Unsigned Reports
        </CardTitle>
        <CardDescription style={{ fontSize: "13px", color: "#586D6A", marginBottom: "16px" }}>
          Report signing status distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={100}
              stroke="#ffffff"
              strokeWidth={2}
            >
              <Cell fill="#178089" />
              <Cell fill="#D65241" />
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} reports`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}