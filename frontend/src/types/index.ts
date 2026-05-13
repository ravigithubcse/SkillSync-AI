export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  avatar?: string;
  title?: string;
  bio?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience: number;
  skills: UserSkill[];
  experiences: Experience[];
  educations: Education[];
  createdAt: string;
}

export interface UserSkill {
  id: string;
  skillId: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience: number;
  endorsed: boolean;
  skill: Skill;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  demandScore: number;
  avgSalary?: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  _count?: { users: number };
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  remote: boolean;
  status: string;
  views: number;
  createdAt: string;
  recruiter: { companyName: string; companySize?: string; industry?: string };
  requirements: JobRequirement[];
  _count: { applications: number };
}

export interface JobRequirement {
  id: string;
  skillId: string;
  skill: Skill;
  required: boolean;
  minYears: number;
}

export interface JobApplication {
  id: string;
  status: string;
  coverLetter?: string;
  matchScore?: number;
  appliedAt: string;
  job: {
    title: string;
    location: string;
    type: string;
    salaryMin?: number;
    salaryMax?: number;
    recruiter: { companyName: string };
  };
}

export interface MentorSession {
  id: string;
  topic: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockInterview {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  completedAt?: string;
  rating?: number;
  notes?: string;
  user: { firstName: string; lastName: string; avatar?: string };
  peer?: { firstName: string; lastName: string; avatar?: string };
}

export interface PeerMatch {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  title?: string;
  yearsOfExperience: number;
  skills: { skillId: string; skill: { name: string } }[];
  matchScore: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatar?: string };
}

export interface MarketData {
  id: string;
  skillId: string;
  date: string;
  jobCount: number;
  avgSalary: number;
  demandIndex: number;
  skill?: { name: string; category: string };
}

export interface Resume {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  atsScore?: number;
  feedback?: string;
  isDefault: boolean;
  createdAt: string;
}
