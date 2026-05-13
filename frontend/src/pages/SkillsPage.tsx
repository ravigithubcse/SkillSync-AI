import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  Search, Plus, X, TrendingUp, CheckCircle, Star,
  Zap, Code, Database, Cloud, Wrench, Palette, Users, Languages,
  Loader2
} from 'lucide-react';
import { getTrendColor, getTrendIcon } from '@/lib/utils';
import toast from 'react-hot-toast';

const categoryIcons: Record<string, any> = {
  PROGRAMMING: Code, FRAMEWORK: Zap, DATABASE: Database, CLOUD: Cloud,
  DEVOPS: Wrench, DESIGN: Palette, MANAGEMENT: Users, SOFT_SKILL: Star,
  LANGUAGE: Languages, OTHER: Code,
};

const proficiencyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export default function SkillsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [yearsExp, setYearsExp] = useState(1);

  const { data: skills } = useQuery({
    queryKey: ['skills', search, selectedCategory],
    queryFn: () => api.get('/skills', { params: { search, category: selectedCategory !== 'ALL' ? selectedCategory : undefined }}).then(r => r.data),
  });

  const { data: trendingSkills } = useQuery({
    queryKey: ['trending-skills'],
    queryFn: () => api.get('/skills/trending').then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['skill-categories'],
    queryFn: () => api.get('/skills/categories').then(r => r.data),
  });

  const addSkillMutation = useMutation({
    mutationFn: () => api.post('/users/skills', { skillId: selectedSkill.id, proficiency, yearsOfExperience: yearsExp }).then(r => r.data),
    onSuccess: () => { toast.success('Skill added!'); setShowAddSkill(false); setSelectedSkill(null); },
    onError: () => toast.error('Failed to add skill'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills & Market Data</h1>
          <p className="text-gray-400 mt-1">Track your skills and see market demand</p>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-green-400" /> Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {trendingSkills?.map((skill: any) => {
            const Icon = categoryIcons[skill.category] || Code;
            return (
              <button key={skill.id} onClick={() => { setSelectedSkill(skill); setShowAddSkill(true); }} className="p-4 bg-dark-900/50 rounded-xl border border-white/5 hover:border-primary-500/30 transition-all text-left group">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} className="text-primary-400" />
                  <span className={`text-xs ${getTrendColor(skill.trend)}`}>{getTrendIcon(skill.trend)}</span>
                </div>
                <p className="font-medium text-white text-sm">{skill.name}</p>
                <p className="text-xs text-gray-400 mt-1">{skill.demandScore}/100 demand</p>
              </button>
            );
          })}
        </div>
      </motion.div>
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills..." className="input pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto scroll-hide">
            <button onClick={() => setSelectedCategory('ALL')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'ALL' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-900/50 text-gray-400 border border-white/5 hover:bg-white/5'}`}>All</button>
            {categories?.map((cat: string) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-900/50 text-gray-400 border border-white/5 hover:bg-white/5'}`}>{cat.replace('_', ' ')}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills?.map((skill: any, i: number) => {
          const Icon = categoryIcons[skill.category] || Code;
          return (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card hover:border-primary-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{skill.name}</h3>
                    <p className="text-xs text-gray-400">{skill.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedSkill(skill); setShowAddSkill(true); }} className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Plus size={16} className="text-primary-400" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Demand Score</span>
                  <span className={`text-xs font-medium ${getTrendColor(skill.trend)}`}>{skill.demandScore}/100 {getTrendIcon(skill.trend)}</span>
                </div>
                <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${skill.demandScore}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                </div>
                {skill.avgSalary && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Avg Salary</span>
                    <span className="text-green-400 font-medium">${(skill.avgSalary / 1000).toFixed(0)}k</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Professionals</span>
                  <span className="text-gray-300">{skill._count?.users || 0}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {showAddSkill && selectedSkill && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Add {selectedSkill.name}</h2>
              <button onClick={() => setShowAddSkill(false)} className="p-1 hover:bg-white/10 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Proficiency</label>
                <div className="grid grid-cols-4 gap-2">
                  {proficiencyLevels.map((level) => (
                    <button key={level} onClick={() => setProficiency(level)} className={`p-2 rounded-xl text-xs font-medium transition-all ${proficiency === level ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-dark-900/50 text-gray-400 border border-white/5 hover:bg-white/5'}`}>{level}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Years of Experience</label>
                <input type="number" value={yearsExp} onChange={(e) => setYearsExp(parseInt(e.target.value) || 0)} min={0} max={50} className="input" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddSkill(false)} className="flex-1 btn-secondary">Cancel</button>
                <button onClick={() => addSkillMutation.mutate()} disabled={addSkillMutation.isPending} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                  {addSkillMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Add Skill</>}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
