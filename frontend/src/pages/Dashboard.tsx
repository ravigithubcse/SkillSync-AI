import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  TrendingUp, Briefcase, Brain, Calendar, Target, Zap,
  ArrowUpRight, ArrowDownRight, Users, Award, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: marketData } = useQuery({
    queryKey: ['market-dashboard'],
    queryFn: () => api.get('/market/dashboard').then(r => r.data),
  });

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/jobs/applications/my').then(r => r.data),
  });

  const { data: interviews } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => api.get('/interviews').then(r => r.data),
  });

  const stats = [
    {
      title: 'Profile Views',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Applications',
      value: applications?.length || 0,
      change: '+5',
      trend: 'up',
      icon: Briefcase,
      color: 'accent',
    },
    {
      title: 'Interview Rate',
      value: '68%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'green',
    },
    {
      title: 'Market Score',
      value: '85/100',
      change: '+3',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your career journey
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/jobs" className="btn-primary text-sm">
            Find Jobs
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const colorClasses = {
            primary: 'from-primary-500/20 to-primary-600/10 text-primary-400',
            accent: 'from-accent-500/20 to-accent-600/10 text-accent-400',
            green: 'from-green-500/20 to-green-600/10 text-green-400',
            blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
          };

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/mentor" className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all group">
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                <Brain size={24} className="text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-white">AI Mentor</p>
                <p className="text-sm text-gray-400">Get personalized advice</p>
              </div>
            </Link>
            <Link to="/interviews" className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-accent-500/30 transition-all group">
              <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                <Calendar size={24} className="text-accent-400" />
              </div>
              <div>
                <p className="font-medium text-white">Mock Interview</p>
                <p className="text-sm text-gray-400">Practice with peers</p>
              </div>
            </Link>
            <Link to="/resume" className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-green-500/30 transition-all group">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Award size={24} className="text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">Resume Analyzer</p>
                <p className="text-sm text-gray-400">Check ATS score</p>
              </div>
            </Link>
            <Link to="/market" className="flex items-center gap-4 p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <BookOpen size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Market Trends</p>
                <p className="text-sm text-gray-400">See what's in demand</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Trending Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Trending Skills</h2>
            <Link to="/market" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          <div className="space-y-3">
            {marketData?.trendingSkills?.slice(0, 5).map((skill: any, i: number) => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{skill.name}</span>
                    <span className="text-xs text-green-400">+{skill.demandScore}%</span>
                  </div>
                  <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      style={{ width: `${skill.demandScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Zap size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Loading market data...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Applications & Upcoming Interviews */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
            <Link to="/jobs" className="text-sm text-primary-400 hover:text-primary-300">Browse jobs</Link>
          </div>
          <div className="space-y-3">
            {applications?.slice(0, 3).map((app: any) => (
              <div key={app.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Briefcase size={18} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{app.job.title}</p>
                  <p className="text-sm text-gray-400">{app.job.recruiter.companyName}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    app.status === 'APPLIED' ? 'bg-blue-500/10 text-blue-400' :
                    app.status === 'INTERVIEW' ? 'bg-accent-500/10 text-accent-400' :
                    app.status === 'OFFER' ? 'bg-green-500/10 text-green-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {app.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(app.appliedAt)}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">No applications yet</p>
                <Link to="/jobs" className="text-primary-400 hover:text-primary-300 text-sm">Start applying</Link>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Interviews</h2>
            <Link to="/interviews" className="text-sm text-primary-400 hover:text-primary-300">Schedule</Link>
          </div>
          <div className="space-y-3">
            {interviews?.filter((i: any) => i.status === 'SCHEDULED').slice(0, 3).map((interview: any) => (
              <div key={interview.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl">
                <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-accent-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{interview.type} Interview</p>
                  <p className="text-sm text-gray-400">
                    with {interview.peer ? `${interview.peer.firstName} ${interview.peer.lastName}` : 'AI Mentor'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{formatRelativeTime(interview.scheduledAt)}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">No upcoming interviews</p>
                <Link to="/interviews" className="text-primary-400 hover:text-primary-300 text-sm">Schedule one</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
