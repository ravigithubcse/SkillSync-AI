import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, Users, Zap, ArrowRight, CheckCircle,
  BarChart3, MessageCircle, Target, Globe, Shield
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Career Mentor',
    description: 'Get personalized career advice from our AI mentor trained on industry best practices and real-time market data.',
  },
  {
    icon: TrendingUp,
    title: 'Live Market Insights',
    description: 'Track real-time demand for skills, salary trends, and hiring patterns across the tech industry.',
  },
  {
    icon: Users,
    title: 'Peer Mock Interviews',
    description: 'Practice with real engineers through video interviews. Get feedback and improve your interview skills.',
  },
  {
    icon: Zap,
    title: 'Skill Gap Analysis',
    description: 'Compare your skills against job requirements and get a personalized learning roadmap.',
  },
  {
    icon: Target,
    title: 'ATS Resume Scanner',
    description: 'Upload your resume and get AI-powered feedback to pass applicant tracking systems.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Messaging',
    description: 'Connect with recruiters, mentors, and peers through our built-in messaging platform.',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '10K+', label: 'Jobs Posted' },
  { value: '85%', label: 'Interview Success' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SkillSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm mb-8">
              <Globe size={14} />
              Now with real-time market data
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Supercharge Your<br />
              <span className="gradient-text">Tech Career</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              AI-powered career intelligence platform. Get real-time market insights, 
              practice interviews with peers, and receive personalized mentorship.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2">
                Start Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary">Sign In</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 max-w-5xl mx-auto">
              <div className="bg-dark-900 rounded-xl overflow-hidden aspect-[16/9] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 p-8">
                    <div className="p-4 bg-dark-800 rounded-xl border border-white/5">
                      <BarChart3 size={32} className="text-primary-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Market Analytics</p>
                    </div>
                    <div className="p-4 bg-dark-800 rounded-xl border border-white/5">
                      <Brain size={32} className="text-accent-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">AI Mentor</p>
                    </div>
                    <div className="p-4 bg-dark-800 rounded-xl border border-white/5">
                      <Users size={32} className="text-green-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Peer Matching</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="gradient-text">Land Your Dream Job</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A complete career toolkit powered by AI and real-time data from the tech industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:border-primary-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                    <Icon size={24} className="text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-accent-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Join thousands of engineers who have already transformed their careers with SkillSync AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Free
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Free forever</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> No credit card</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded-md flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="font-bold gradient-text">SkillSync</span>
            </div>
            <p className="text-sm text-gray-500">© 2026 SkillSync AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
