'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

interface ChartProps {
    data: any[];
    xKey?: string;
    yKey?: string;
    type?: 'bar' | 'line' | 'pie' | 'donut' | 'area';
    color?: string;
    colors?: string[];
    height?: number;
    nameKey?: string;
    valueKey?: string;
    showLegend?: boolean;
    unit?: string;
}

const DEFAULT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-3 text-xs font-bold">
                {label && <p className="text-slate-500 mb-1 uppercase tracking-wide">{label}</p>}
                {payload.map((entry: any, i: number) => (
                    <p key={i} style={{ color: entry.color || entry.fill }} className="font-black">
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{unit || ''}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        </div>
        <p className="text-xs font-black uppercase tracking-widest">No data available</p>
    </div>
);

export function AnalyticsChart({
    data, xKey = 'name', yKey = 'progress', type = 'bar',
    color = '#2563eb', colors, height = 300,
    nameKey = 'name', valueKey = 'value',
    showLegend = false, unit = '%'
}: ChartProps) {
    if (!data || data.length === 0) return <EmptyState />;

    const resolvedColors = colors || DEFAULT_COLORS;

    const commonAxis = {
        xAxis: <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />,
        yAxis: <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v}${unit}`} />,
        grid: <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />,
    };

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                {type === 'bar' ? (
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        {commonAxis.grid}
                        {commonAxis.xAxis}
                        {commonAxis.yAxis}
                        <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: '#f8fafc' }} />
                        {showLegend && <Legend />}
                        <Bar dataKey={yKey} radius={[6, 6, 0, 0]} barSize={36}>
                            {data.map((_: any, i: number) => (
                                <Cell key={i} fill={resolvedColors[i % resolvedColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : type === 'line' ? (
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        {commonAxis.grid}
                        {commonAxis.xAxis}
                        {commonAxis.yAxis}
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
                    </LineChart>
                ) : type === 'area' ? (
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {commonAxis.grid}
                        {commonAxis.xAxis}
                        {commonAxis.yAxis}
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} fill="url(#areaGradient)" dot={{ r: 4, fill: color }} />
                    </AreaChart>
                ) : (type === 'pie' || type === 'donut') ? (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={type === 'donut' ? '55%' : 0}
                            outerRadius="80%"
                            dataKey={valueKey}
                            nameKey={nameKey}
                            paddingAngle={3}
                        >
                            {data.map((entry: any, i: number) => (
                                <Cell key={i} fill={entry.color || resolvedColors[i % resolvedColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && (
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value) => <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{value}</span>}
                            />
                        )}
                    </PieChart>
                ) : <g />}
            </ResponsiveContainer>
        </div>
    );
}
