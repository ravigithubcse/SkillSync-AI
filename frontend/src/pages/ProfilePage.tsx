import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  User, MapPin, Link as LinkIcon, Briefcase, GraduationCap, Star,
  Edit2, Save, X, Plus, Trash2, Loader2, Github, Linkedin, Globe
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: user?.title || '',
    bio: user?.bio || '',
    location: user?.location || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    yearsOfExperience: user?.yearsOfExperience || 0,
  });

  const { data: profile, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => api.get(`/users/${user?.id}`).then(r => r.data),
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put('/auth/profile', formData).then(r => r.data),
    onSuccess: (data) => {
      updateUser(data);
      setIsEditing(false);
      toast.success('Profile updated!');
      refetch();
    },
    onError: () => toast.error('Failed to update profile'),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary-600/20 to-accent-600/20" />

        <div className="relative pt-16 px-4 pb-6">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </div>
            <div className="flex-1 mb-2">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input w-40"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input w-40"
                      placeholder="Last Name"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input w-80"
                    placeholder="Professional Title"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                  <p className="text-gray-400">{user?.title || 'No title set'}</p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2 text-sm">
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input"
                    placeholder="Location"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-500" />
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="input"
                    placeholder="Years of Experience"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin size={16} className="text-gray-500" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="input"
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Github size={16} className="text-gray-500" />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="input"
                    placeholder="GitHub URL"
                  />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Globe size={16} className="text-gray-500" />
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="input"
                    placeholder="Portfolio URL"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {user?.location && <span className="flex items-center gap-1"><MapPin size={14} /> {user.location}</span>}
              {user?.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Linkedin size={14} /> LinkedIn</a>}
              {user?.githubUrl && <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Github size={14} /> GitHub</a>}
              {user?.portfolioUrl && <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Globe size={14} /> Portfolio</a>}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star size={18} className="text-primary-400" /> Skills
            </h2>
            <a href="/skills" className="text-sm text-primary-400 hover:text-primary-300">Manage</a>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.skills?.map((skill: any) => (
              <span key={skill.id} className="badge bg-primary-500/10 text-primary-400">
                {skill.skill.name}
                <span className="ml-1 text-xs text-gray-500">{skill.proficiency}</span>
              </span>
            )) || <p className="text-sm text-gray-500">No skills added yet</p>}
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-accent-400" /> Experience
          </h2>
          <div className="space-y-4">
            {profile?.experiences?.map((exp: any) => (
              <div key={exp.id} className="flex gap-4 p-4 bg-dark-900/50 rounded-xl">
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{exp.title}</p>
                  <p className="text-sm text-gray-400">{exp.company} • {exp.location}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </p>
                  {exp.description && <p className="text-sm text-gray-400 mt-2">{exp.description}</p>}
                </div>
              </div>
            )) || <p className="text-sm text-gray-500">No experience added yet</p>}
          </div>
        </motion.div>
      </div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <GraduationCap size={18} className="text-green-400" /> Education
        </h2>
        <div className="space-y-4">
          {profile?.educations?.map((edu: any) => (
            <div key={edu.id} className="flex gap-4 p-4 bg-dark-900/50 rounded-xl">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-green-400" />
              </div>
              <div>
                <p className="font-medium text-white">{edu.institution}</p>
                <p className="text-sm text-gray-400">{edu.degree} in {edu.field}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </p>
              </div>
            </div>
          )) || <p className="text-sm text-gray-500">No education added yet</p>}
        </div>
      </motion.div>
    </div>
  );
}
