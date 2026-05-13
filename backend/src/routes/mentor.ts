import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  context: z.object({
    topic: z.string().optional(),
    currentRole: z.string().optional(),
    targetRole: z.string().optional(),
    yearsExperience: z.number().optional(),
  }).optional(),
});

router.post('/chat', authenticate, validate(chatSchema), async (req, res, next) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback mock response for demo without API key
      return res.json({
        response: getMockMentorResponse(req.body.message, req.body.context),
        sessionId: req.body.sessionId || 'mock-session',
        suggestions: [
          'How do I negotiate salary?',
          'What skills should I learn next?',
          'Help me prepare for system design interviews',
        ],
      });
    }

    const { message, sessionId, context } = req.body;
    const userId = req.user!.id;

    let session;
    if (sessionId) {
      session = await prisma.mentorSession.findUnique({ where: { id: sessionId } });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        experiences: true,
      },
    });

    const systemPrompt = `You are SkillSync AI, an expert career mentor and technical advisor. You help software engineers and tech professionals with:
- Career progression and role transitions
- Technical skill development roadmaps
- Interview preparation strategies
- Salary negotiation tactics
- Resume and portfolio optimization
- Industry trends and market insights

User Profile:
${user?.title ? `Current Role: ${user.title}` : ''}
${user?.yearsOfExperience ? `Experience: ${user.yearsOfExperience} years` : ''}
${user?.skills.length ? `Skills: ${user.skills.map(s => s.skill.name).join(', ')}` : ''}
${context?.targetRole ? `Target Role: ${context.targetRole}` : ''}

Be concise, actionable, and specific. Provide concrete examples and steps.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (session?.messages) {
      const prevMessages = session.messages as any[];
      messages.push(...prevMessages.slice(-6));
    }

    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    const updatedMessages = [
      ...(session?.messages as any[] || []),
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse },
    ];

    const savedSession = await prisma.mentorSession.upsert({
      where: { id: sessionId || 'new' },
      update: {
        messages: updatedMessages,
        topic: context?.topic || session?.topic || 'General Career Advice',
      },
      create: {
        userId,
        topic: context?.topic || 'General Career Advice',
        messages: updatedMessages,
      },
    });

    res.json({
      response: aiResponse,
      sessionId: savedSession.id,
      suggestions: generateSuggestions(message, aiResponse),
    });
  } catch (error) {
    logger.error('AI Mentor error:', error);
    next(new AppError(500, 'AI service temporarily unavailable', 'AI_ERROR'));
  }
});

router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    const sessions = await prisma.mentorSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        topic: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.get('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const session = await prisma.mentorSession.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!session) throw new AppError(404, 'Session not found', 'NOT_FOUND');
    res.json(session);
  } catch (error) {
    next(error);
  }
});

function getMockMentorResponse(message: string, context?: any): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('salary') || lowerMsg.includes('negotiate')) {
    return `**Salary Negotiation Strategy:**

1. **Research First**: Use levels.fyi, Glassdoor, and our Market Data tool to find the salary range for ${context?.targetRole || 'your target role'} in your location.

2. **Anchor High**: Always give a range, with the bottom of your range being your target number. Example: "Based on my research and experience, I'm looking for $120k-$140k."

3. **Total Compensation**: Consider base salary, equity, bonus, benefits, and remote flexibility. Sometimes a lower base with strong equity is better long-term.

4. **Leverage Multiple Offers**: Having 2-3 offers increases your negotiating power by 30-40% on average.

5. **Practice the Conversation**: Use our Mock Interview feature to practice salary negotiation scenarios with peers.`;
  }

  if (lowerMsg.includes('skill') || lowerMsg.includes('learn')) {
    return `**Skill Development Roadmap:**

Based on current market trends (updated daily in our platform):

**High-Demand Skills Right Now:**
- AI/ML Engineering (Python, TensorFlow, LLMs)
- Cloud Architecture (AWS, GCP, Kubernetes)
- System Design & Distributed Systems
- Data Engineering (Spark, Airflow, dbt)

**Recommended Learning Path:**
1. **Foundation**: Strengthen your ${context?.currentRole || 'current'} fundamentals
2. **Specialization**: Pick one high-demand niche
3. **Projects**: Build 2-3 portfolio projects using these skills
4. **Community**: Join peer mock interviews to validate your knowledge

Check the Skill Gap Analyzer in your dashboard for a personalized plan.`;
  }

  return `**Career Advice:**

Thank you for reaching out! Based on your profile and current market data, here are my recommendations:

1. **Stay Current**: The tech landscape changes rapidly. Dedicate 5-10 hours weekly to learning.

2. **Network Strategically**: Quality connections > Quantity. Focus on engineers 1-2 levels above you.

3. **Build in Public**: Share your learnings on LinkedIn, GitHub, or a blog. This attracts opportunities.

4. **Practice Interviews**: Our platform shows users who practice 5+ mock interviews have a 3x higher offer rate.

5. **Track Applications**: Use our Job Tracker to stay organized and follow up strategically.

What specific area would you like to dive deeper into?`;
}

function generateSuggestions(message: string, response: string): string[] {
  return [
    'How do I prepare for system design interviews?',
    'What is the current market salary for senior engineers?',
    'Help me create a 6-month learning plan',
  ];
}

export { router as mentorRouter };
