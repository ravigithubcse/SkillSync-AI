import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  Search, MapPin, DollarSign, Briefcase, Remote, Filter,
  ChevronDown, Bookmark, BookmarkCheck, Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const jobTypes = ['ALL', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'];

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('ALL');
  const [remote, setRemote] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, location, type, remote, page],
    queryFn: () => api.get('/jobs', {
      params: { search, location, type: type !== 'ALL' ? type : undefined, remote, page }
    }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Find Your Next Role</h1>
        <p className="text-gray-400">{data?.pagination?.total || 0} jobs available</p>
      </div>

      {/* Search & Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or keywords..."
              className="input pl-10"
            />
          </div>
          <div className="relative md:w-64">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="input pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Type:</span>
            <div className="flex gap-1">
              {jobTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    type === t
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-dark-900/50 text-gray-400 border border-white/5 hover:bg-white/5'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={remote}
              onChange={(e) => setRemote(e.target.checked)}
              className="rounded bg-dark-800 border-white/10 text-primary-500"
            />
            Remote only
          </label>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary-400" />
          </div>
        ) : data?.jobs?.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No jobs found matching your criteria</p>
          </div>
        ) : (
          data?.jobs?.map((job: any, i: number) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/jobs/${job.id}`} className="card hover:border-primary-500/30 transition-all block">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={24} className="text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                      <p className="text-sm text-gray-400">{job.recruiter.companyName}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={12} /> {job.location}
                        </span>
                        {job.remote && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <Remote size={12} /> Remote
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <DollarSign size={12} />
                          {job.salaryMin && job.salaryMax
                            ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                            : 'Salary not disclosed'}
                        </span>
                        <span className="badge bg-dark-900 text-gray-400">{job.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.requirements?.slice(0, 4).map((req: any) => (
                          <span key={req.id} className="badge bg-primary-500/10 text-primary-400 text-xs">
                            {req.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <Bookmark size={18} className="text-gray-500" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
            disabled={page === data.pagination.pages}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
