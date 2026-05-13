import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import {
  Calendar, Video, Users, Star, Clock, ChevronRight, Plus,
  Loader2, Filter, MessageCircle, CheckCircle, XCircle
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const interviewTypes = [
  { value: 'TECHNICAL', label: 'Technical', color: 'primary' },
  { value: 'BEHAVIORAL', label: 'Behavioral', color: 'accent' },
  { value: 'SYSTEM_DESIGN', label: 'System Design', color: 'green' },
  { value: 'CODING', label: 'Coding', color: 'blue' },
  { value: 'HR', label: 'HR Round', color: 'purple' },
];

export default function InterviewsPage() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedType, setSelectedType] = useState('TECHNICAL');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: interviews, isLoading, refetch } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get('/interviews').then(r => r.data),
  });

  const { data: peerMatches } = useQuery({
    queryKey: ['peer-matches'],
    queryFn: () => api.get('/interviews/peers/match').then(r => r.data),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => api.post('/interviews/schedule', {
      type: selectedType,
      scheduledAt: new Date(scheduledAt).toISOString(),
    }).then(r => r.data),
    onSuccess: () => {
      toast.success('Interview scheduled!');
      setShowSchedule(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to schedule');
    },
  });

  const upcoming = interviews?.filter((i: any) => i.status === 'SCHEDULED') || [];
  const completed = interviews?.filter((i: any) => i.status === 'COMPLETED') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Interviews</h1>
          <p className="text-gray-400 mt-1">Practice with peers and improve your interview skills</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Schedule Interview
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'green' },
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'primary' },
          { label: 'Avg Rating', value: '4.5/5', icon: Star, color: 'accent' },
          { label: 'Practice Hours', value: '12h', icon: Clock, color: 'blue' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <Icon size={18} className={`text-${stat.color}-400`} />
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Interviews */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Sessions</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary-400" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-3">No upcoming interviews</p>
              <button onClick={() => setShowSchedule(true)} className="text-primary-400 hover:text-primary-300 text-sm">
                Schedule your first mock interview
              </button>
            </div>
          ) : (
            upcoming.map((interview: any, i: number) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                      <Video size={24} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{interview.type} Interview</p>
                      <p className="text-sm text-gray-400">
                        with {interview.peer ? `${interview.peer.firstName} ${interview.peer.lastName}` : 'AI Mentor'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} /> {formatRelativeTime(interview.scheduledAt)}
                        </span>
                        <span className="badge bg-accent-500/10 text-accent-400 text-xs">
                          {interview.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/messages/${interview.peer?.id}`}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MessageCircle size={18} className="text-gray-400" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Peer Matches */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Suggested Peers</h2>
          <div className="space-y-3">
            {peerMatches?.slice(0, 5).map((peer: any) => (
              <div key={peer.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {peer.firstName[0]}{peer.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{peer.firstName} {peer.lastName}</p>
                    <p className="text-xs text-gray-400">{peer.title || 'Software Engineer'}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-green-500/10 text-green-400 text-xs">
                      {peer.matchScore}% match
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {peer.skills?.slice(0, 3).map((s: any) => (
                    <span key={s.skillId} className="badge bg-dark-900 text-gray-400 text-xs">
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )) || (
              <div className="card text-center py-8">
                <Users size={32} className="mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-400">Add more skills to find peers</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-white mb-4">Schedule Mock Interview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Interview Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedType === type.value
                          ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                          : 'border-white/5 bg-dark-900/50 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSchedule(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => scheduleMutation.mutate()}
                  disabled={!scheduledAt || scheduleMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>
                    <Calendar size={18} /> Schedule
                  </>}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
