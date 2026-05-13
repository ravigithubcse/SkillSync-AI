import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Briefcase, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'JOB_SEEKER' as 'JOB_SEEKER' | 'RECRUITER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">SkillSync</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400">Start your career transformation today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input pr-10"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'JOB_SEEKER' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  formData.role === 'JOB_SEEKER'
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-white/10 bg-dark-800/50 text-gray-400 hover:bg-white/5'
                }`}
              >
                <User size={18} /> Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  formData.role === 'RECRUITER'
                    ? 'border-primary-500/50 bg-primary-500/10 text-primary-400'
                    : 'border-white/10 bg-dark-800/50 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Briefcase size={18} /> Recruiter
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>
              Create Account <ArrowRight size={18} />
            </>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
