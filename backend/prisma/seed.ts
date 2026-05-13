import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create skills
  const skills = [
    { name: 'JavaScript', category: 'PROGRAMMING', demandScore: 95, avgSalary: 120000, trend: 'RISING' },
    { name: 'TypeScript', category: 'PROGRAMMING', demandScore: 92, avgSalary: 125000, trend: 'RISING' },
    { name: 'React', category: 'FRAMEWORK', demandScore: 90, avgSalary: 130000, trend: 'STABLE' },
    { name: 'Node.js', category: 'FRAMEWORK', demandScore: 88, avgSalary: 125000, trend: 'STABLE' },
    { name: 'Python', category: 'PROGRAMMING', demandScore: 96, avgSalary: 135000, trend: 'RISING' },
    { name: 'AWS', category: 'CLOUD', demandScore: 94, avgSalary: 140000, trend: 'RISING' },
    { name: 'Docker', category: 'DEVOPS', demandScore: 85, avgSalary: 130000, trend: 'STABLE' },
    { name: 'Kubernetes', category: 'DEVOPS', demandScore: 82, avgSalary: 145000, trend: 'RISING' },
    { name: 'PostgreSQL', category: 'DATABASE', demandScore: 80, avgSalary: 120000, trend: 'STABLE' },
    { name: 'MongoDB', category: 'DATABASE', demandScore: 75, avgSalary: 115000, trend: 'DECLINING' },
    { name: 'GraphQL', category: 'FRAMEWORK', demandScore: 70, avgSalary: 125000, trend: 'STABLE' },
    { name: 'Go', category: 'PROGRAMMING', demandScore: 78, avgSalary: 140000, trend: 'RISING' },
    { name: 'Rust', category: 'PROGRAMMING', demandScore: 72, avgSalary: 150000, trend: 'RISING' },
    { name: 'System Design', category: 'SOFT_SKILL', demandScore: 88, avgSalary: 160000, trend: 'STABLE' },
    { name: 'Machine Learning', category: 'PROGRAMMING', demandScore: 93, avgSalary: 155000, trend: 'RISING' },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill,
    });
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@skillsync.ai' },
    update: {},
    create: {
      email: 'demo@skillsync.ai',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Developer',
      role: 'JOB_SEEKER',
      title: 'Senior Full Stack Engineer',
      bio: 'Passionate about building scalable web applications and mentoring junior developers.',
      location: 'San Francisco, CA',
      yearsOfExperience: 5,
      skills: {
        create: [
          { skillId: (await prisma.skill.findUnique({ where: { name: 'JavaScript' } }))!.id, proficiency: 'EXPERT', yearsOfExperience: 5 },
          { skillId: (await prisma.skill.findUnique({ where: { name: 'TypeScript' } }))!.id, proficiency: 'ADVANCED', yearsOfExperience: 3 },
          { skillId: (await prisma.skill.findUnique({ where: { name: 'React' } }))!.id, proficiency: 'EXPERT', yearsOfExperience: 4 },
          { skillId: (await prisma.skill.findUnique({ where: { name: 'Node.js' } }))!.id, proficiency: 'ADVANCED', yearsOfExperience: 4 },
          { skillId: (await prisma.skill.findUnique({ where: { name: 'AWS' } }))!.id, proficiency: 'INTERMEDIATE', yearsOfExperience: 2 },
        ],
      },
      experiences: {
        create: [
          {
            company: 'TechCorp Inc.',
            title: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            startDate: new Date('2021-03-01'),
            current: true,
            description: 'Leading frontend architecture decisions and mentoring team of 5 engineers.',
            skills: ['React', 'TypeScript', 'Node.js'],
          },
          {
            company: 'StartupXYZ',
            title: 'Full Stack Developer',
            location: 'Remote',
            startDate: new Date('2019-06-01'),
            endDate: new Date('2021-02-28'),
            current: false,
            description: 'Built core product features from scratch. Grew user base from 1K to 100K.',
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          },
        ],
      },
      educations: {
        create: [
          {
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: new Date('2015-08-01'),
            endDate: new Date('2019-05-15'),
            current: false,
            gpa: '3.8',
          },
        ],
      },
    },
  });

  // Create demo recruiter
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@techcorp.com' },
    update: {},
    create: {
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Hiring',
      role: 'RECRUITER',
      title: 'Technical Recruiter',
      recruiterProfile: {
        create: {
          companyName: 'TechCorp Inc.',
          companySize: '500-1000',
          industry: 'Technology',
          website: 'https://techcorp.com',
        },
      },
    },
  });

  // Create demo job postings
  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: recruiter.id },
  });

  if (recruiterProfile) {
    const jobs = [
      {
        title: 'Senior Frontend Engineer',
        description: 'We are looking for a Senior Frontend Engineer to lead our web platform team. You will be responsible for architecture decisions, performance optimization, and mentoring junior developers.',
        location: 'San Francisco, CA',
        type: 'FULL_TIME' as const,
        salaryMin: 150000,
        salaryMax: 200000,
        remote: true,
        recruiterId: recruiterProfile.id,
      },
      {
        title: 'Backend Engineer - Distributed Systems',
        description: 'Join our infrastructure team building high-throughput distributed systems. Experience with microservices and cloud-native architectures required.',
        location: 'New York, NY',
        type: 'FULL_TIME' as const,
        salaryMin: 160000,
        salaryMax: 220000,
        remote: false,
        recruiterId: recruiterProfile.id,
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Build and deploy ML models for our recommendation engine. Strong Python skills and experience with PyTorch or TensorFlow required.',
        location: 'Remote',
        type: 'FULL_TIME' as const,
        salaryMin: 170000,
        salaryMax: 250000,
        remote: true,
        recruiterId: recruiterProfile.id,
      },
    ];

    for (const job of jobs) {
      await prisma.jobPosting.create({
        data: {
          ...job,
          requirements: {
            create: [
              { skillId: (await prisma.skill.findUnique({ where: { name: 'JavaScript' } }))!.id, required: true, minYears: 3 },
              { skillId: (await prisma.skill.findUnique({ where: { name: 'React' } }))!.id, required: true, minYears: 2 },
              { skillId: (await prisma.skill.findUnique({ where: { name: 'TypeScript' } }))!.id, required: false, minYears: 1 },
            ],
          },
        },
      });
    }
  }

  // Generate market data
  const allSkills = await prisma.skill.findMany();
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const skill of allSkills.slice(0, 5)) {
      await prisma.marketData.create({
        data: {
          skillId: skill.id,
          date,
          jobCount: Math.floor(Math.random() * 500) + 100,
          avgSalary: skill.avgSalary ? skill.avgSalary + Math.floor(Math.random() * 20000) - 10000 : 120000,
          demandIndex: skill.demandScore + Math.floor(Math.random() * 10) - 5,
          location: 'Global',
        },
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('Demo accounts:');
  console.log('  Job Seeker: demo@skillsync.ai / password123');
  console.log('  Recruiter: recruiter@techcorp.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
