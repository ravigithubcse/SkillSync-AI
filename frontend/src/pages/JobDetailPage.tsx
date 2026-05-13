import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  ArrowLeft, MapPin, DollarSign, Briefcase, Remote, Calendar,
  Users, CheckCircle, XCircle, Loader2, Send
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [showApply, setShowApply] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(r => r.data),
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${id}/apply`, { coverLetter }).then(r => r.data),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setShowApply(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to apply');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <XCircle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="text-gray-400">Job not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to jobs
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center">
              <Briefcase size={32} className="text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{job.title}</h1>
              <p className="text-lg text-gray-400">{job.recruiter.companyName}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin size={14} /> {job.location}
                </span>
                {job.remote && (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <Remote size={14} /> Remote OK
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Users size={14} /> {job._count.applications} applications
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar size={14} /> Posted {formatDate(job.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowApply(!showApply)}
            className="btn-primary"
          >
            Apply Now
          </button>
        </div>

        {job.salaryMin && (
          <div className="flex items-center gap-2 p-4 bg-green-500/5 border border-green-500/10 rounded-xl mb-6">
            <DollarSign size={20} className="text-green-400" />
            <span className="text-green-400 font-semibold">
              {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
            </span>
            <span className="text-sm text-gray-400">per year</span>
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
          <div className="space-y-2">
            {job.requirements?.map((req: any) => (
              <div key={req.id} className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                <CheckCircle size={18} className={req.required ? 'text-primary-400' : 'text-gray-500'} />
                <div>
                  <span className="text-white font-medium">{req.skill.name}</span>
                  {req.minYears > 0 && (
                    <span className="text-sm text-gray-400 ml-2">{req.minYears}+ years</span>
                  )}
                  {!req.required && (
                    <span className="badge bg-gray-500/10 text-gray-400 text-xs ml-2">Preferred</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Apply Modal */}
      {showApply && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Apply for {job.title}</h2>
              <button onClick={() => setShowApply(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Cover Letter (Optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="input resize-none"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl">
                <p className="text-sm text-primary-400 font-medium mb-1">Your profile will be shared</p>
                <p className="text-xs text-gray-400">
                  The recruiter will see your profile, skills, experience, and resume.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApply(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {applyMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <>
                    <Send size={18} /> Submit Application
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
