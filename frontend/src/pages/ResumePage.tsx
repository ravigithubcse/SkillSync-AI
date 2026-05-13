import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  Trash2, Award, TrendingUp, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const [uploading, setUploading] = useState(false);

  const { data: resumes, refetch } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/resumes').then(r => r.data),
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded!');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [refetch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const analyzeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/resumes/${id}/analyze`).then(r => r.data),
    onSuccess: () => { toast.success('Analysis complete!'); refetch(); },
    onError: () => toast.error('Analysis failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`).then(r => r.data),
    onSuccess: () => { toast.success('Resume deleted'); refetch(); },
  });

  const latestResume = resumes?.[0];
  const feedback = latestResume?.feedback ? JSON.parse(latestResume.feedback) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resume Analyzer</h1>
        <p className="text-gray-400 mt-1">Upload your resume and get AI-powered feedback</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 hover:border-white/20 bg-dark-900/30'}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="animate-spin text-primary-400" />
              <p className="text-gray-400">Uploading and analyzing...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-primary-400" />
              </div>
              <p className="text-lg font-medium text-white mb-2">{isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}</p>
              <p className="text-sm text-gray-400 mb-4">or click to browse (PDF only, max 5MB)</p>
              <button className="btn-secondary text-sm">Select File</button>
            </>
          )}
        </div>
      </motion.div>
      {latestResume && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-primary-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{latestResume.originalName}</h2>
                  <p className="text-sm text-gray-400">Uploaded {new Date(latestResume.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => analyzeMutation.mutate(latestResume.id)} disabled={analyzeMutation.isPending} className="btn-secondary text-sm flex items-center gap-2">
                  {analyzeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  Re-analyze
                </button>
                <button onClick={() => deleteMutation.mutate(latestResume.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-xl transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {latestResume.atsScore && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-dark-900/50 rounded-xl">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={latestResume.atsScore >= 80 ? '#22c55e' : latestResume.atsScore >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${latestResume.atsScore}, 100`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{latestResume.atsScore}</span>
                  </div>
                  <p className="text-sm font-medium text-white">ATS Score</p>
                </div>
                <div className="text-center p-4 bg-dark-900/50 rounded-xl">
                  <Award size={32} className="mx-auto mb-2 text-accent-400" />
                  <p className="text-2xl font-bold text-white">{feedback?.formatScore || 0}</p>
                  <p className="text-sm text-gray-400">Format Score</p>
                </div>
                <div className="text-center p-4 bg-dark-900/50 rounded-xl">
                  <TrendingUp size={32} className="mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">{feedback?.contentScore || 0}</p>
                  <p className="text-sm text-gray-400">Content Score</p>
                </div>
              </div>
            )}
            {feedback && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-green-400" /> Strengths</h3>
                  <ul className="space-y-2">
                    {feedback.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-3"><AlertCircle size={16} className="text-yellow-400" /> Improvements</h3>
                  <ul className="space-y-2">
                    {feedback.improvements?.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {feedback?.keywords && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="font-semibold text-white mb-3">Keywords Found</h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.keywords.map((kw: string) => (
                    <span key={kw} className="badge bg-green-500/10 text-green-400"><CheckCircle size={12} className="inline mr-1" /> {kw}</span>
                  ))}
                  {feedback.missingKeywords?.map((kw: string) => (
                    <span key={kw} className="badge bg-red-500/10 text-red-400"><AlertCircle size={12} className="inline mr-1" /> {kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
