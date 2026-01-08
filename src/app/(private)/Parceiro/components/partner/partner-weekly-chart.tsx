"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { day: "Seg", receita: 45000 },
  { day: "Ter", receita: 52000 },
  { day: "Qua", receita: 48000 },
  { day: "Qui", receita: 61000 },
  { day: "Sex", receita: 72000 },
  { day: "Sáb", receita: 85000 },
  { day: "Dom", receita: 67000 },
]

export function PartnerWeeklyChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`${value.toLocaleString("pt-AO")} Kz`, "Receita"]}
          />
          <Area
            type="monotone"
            dataKey="receita"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReceita)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
