import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Briefcase,
  ArrowUpRight, ArrowDownRight, BarChart3, Globe, Zap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const COLORS = ['#3b82f6', '#d946ef', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function MarketPage() {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-dashboard'],
    queryFn: () => api.get('/market/dashboard').then(r => r.data),
  });

  const { data: demandData } = useQuery({
    queryKey: ['demand-heatmap'],
    queryFn: () => api.get('/market/demand-heatmap').then(r => r.data),
  });

  const salaryTrendData = marketData?.salaryTrend?.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avgSalary: Math.round(d._avg.avgSalary || 0),
    jobCount: d._sum.jobCount || 0,
  })) || [];

  const skillDemandData = demandData?.slice(0, 8).map((s: any) => ({
    name: s.name,
    demand: s.demandScore,
    salary: s.avgSalary || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
          <p className="text-gray-400 mt-1">Real-time tech job market insights and trends</p>
        </div>
        <div className="badge bg-green-500/10 text-green-400 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live Data
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: marketData?.summary?.totalActiveJobs || 0, icon: Briefcase, color: 'primary', change: '+12%' },
          { label: 'Avg Salary', value: formatCurrency(marketData?.summary?.avgMarketSalary || 0), icon: DollarSign, color: 'green', change: '+5%' },
          { label: 'Top Category', value: marketData?.summary?.topHiringCategory || 'Programming', icon: Zap, color: 'accent', change: 'Hot' },
          { label: 'Growth Rate', value: '+18%', icon: TrendingUp, color: 'blue', change: 'YoY' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className={`text-${stat.color}-400`} />
                <span className="text-xs text-green-400 font-medium">{stat.change}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Salary Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Salary Trends (30 Days)</h2>
            <BarChart3 size={18} className="text-gray-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryTrendData}>
                <defs>
                  <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Avg Salary']}
                />
                <Area type="monotone" dataKey="avgSalary" stroke="#3b82f6" fill="url(#salaryGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Job Postings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Job Postings Volume</h2>
            <Globe size={18} className="text-gray-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryTrendData}>
                <defs>
                  <linearGradient id="jobGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="jobCount" stroke="#d946ef" fill="url(#jobGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Skill Demand Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Skill Demand vs Salary Heatmap</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillDemandData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <PolarRadiusAxis stroke="#6b7280" fontSize={10} />
                <Radar name="Demand" dataKey="demand" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Salary" dataKey="salary" stroke="#d946ef" fill="#d946ef" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => [name === 'salary' ? formatCurrency(value) : `${value}/100`, name]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {demandData?.slice(0, 10).map((skill: any, i: number) => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{skill.demandScore}/100</span>
                      {skill.trend === 'RISING' && <ArrowUpRight size={14} className="text-green-400" />}
                      {skill.trend === 'DECLINING' && <ArrowDownRight size={14} className="text-red-400" />}
                      {skill.trend === 'STABLE' && <Minus size={14} className="text-gray-400" />}
                    </div>
                  </div>
                  <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.demandScore}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hot Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Hot Jobs Right Now</h2>
          <Link to="/jobs" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData?.hotJobs?.map((job: any) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Briefcase size={18} className="text-primary-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.recruiter.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge bg-green-500/10 text-green-400 text-xs">
                  {job._count.applications} applicants
                </span>
                {job.remote && <span className="badge bg-blue-500/10 text-blue-400 text-xs">Remote</span>}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
