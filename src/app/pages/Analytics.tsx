import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Music2, Play, Download, Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#8B5CF6', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#06B6D4'];

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsData = await api.get('/analytics/');
        setData(analyticsData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-[#A3A3A3] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6]" />
        <p className="text-lg font-medium animate-pulse">Analyzing platform data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-red-500 space-y-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-bold">Analytics Unavailable</p>
        <p className="text-[#A3A3A3]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F1F1]">Analytics & Streams</h1>
          <p className="text-[#A3A3A3] mt-1">Track platform performance and user engagement</p>
        </div>
        <button className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streams Over Time */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h2 className="text-xl font-bold text-[#F1F1F1] mb-6">Streams (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.streams_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis 
                dataKey="date" 
                stroke="#A3A3A3" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#A3A3A3" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F1F1F1',
                }}
              />
              <Line
                type="monotone"
                dataKey="streams"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {data.streams_over_time.length === 0 && (
            <p className="text-center py-10 text-[#A3A3A3]">No streaming data available for this period.</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
          <h2 className="text-xl font-bold text-[#F1F1F1] mb-6">Track Distribution by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.category_distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="category"
              >
                {data.category_distribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F1F1F1',
                }}
              />
              <Legend
                wrapperStyle={{ color: '#F1F1F1' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
          {data.category_distribution.length === 0 && (
            <p className="text-center py-10 text-[#A3A3A3]">No category data found.</p>
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6">
        <h2 className="text-xl font-bold text-[#F1F1F1] mb-4">Detailed Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
            <p className="text-[#A3A3A3] text-sm mb-1">Peak Day</p>
            <p className="text-xl font-bold text-white">
              {data.streams_over_time.length > 0 
                ? new Date([...data.streams_over_time].sort((a,b) => b.streams - a.streams)[0].date).toLocaleDateString([], { weekday: 'long' })
                : 'N/A'
              }
            </p>
          </div>
          <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
            <p className="text-[#A3A3A3] text-sm mb-1">Top Category</p>
            <p className="text-xl font-bold text-white">
              {data.category_distribution.length > 0 ? data.category_distribution[0].category : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
            <p className="text-[#A3A3A3] text-sm mb-1">Growth Forecast</p>
            <p className="text-xl font-bold text-[#22C55E]">Stable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
