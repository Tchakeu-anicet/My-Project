export function buildRoleAwareReply(query, userRole = 'visitor', userName = 'Guest', conversation = []) {
  const q = String(query || '').trim();

  if (!q) {
    return `Hello ${userName}, I can help with job searches, applications, recruiter workflows, profile updates, gigs, and premium features. Please ask a clear question and I’ll guide you.`;
  }

  const lowerQ = q.toLowerCase();
  const recentContext = Array.isArray(conversation)
    ? conversation
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .slice(-6)
        .map((item) => String(item.text).trim().toLowerCase())
        .join(' ')
    : '';
  const mergedContext = `${lowerQ} ${recentContext}`;
  const isRecruiter = userRole === 'recruiter';
  const isSeeker = userRole === 'seeker';

  if (lowerQ.includes('solo entrepreneur') || lowerQ.includes('solo business') || lowerQ.includes('self-employed') || lowerQ.includes('independent business')) {
    return 'A solo entrepreneur runs and manages their own business independently. On JobFind, that often means creating a profile, offering a service or skill, searching for flexible work, managing their own schedule, and connecting with clients or companies who need independent professionals.';
  }

  if (mergedContext.includes('household') || mergedContext.includes('caregiver') || mergedContext.includes('domestic worker') || mergedContext.includes('home services')) {
    return 'Household or home services are usually matched by location, availability, and service type. A candidate can profile their skills, describe their experience, and apply to relevant household or care roles that fit their schedule.';
  }

  if (lowerQ.includes('who are you') || lowerQ.includes('what are you') || lowerQ.includes('your name')) {
    return 'I am JobFind AI, your platform assistant. I help job seekers and recruiters with searches, applications, gig listings, profiles, job posting, and platform navigation.';
  }

  if (mergedContext.includes('gig') || mergedContext.includes('gigs') || mergedContext.includes('freelance') || mergedContext.includes('short task')) {
    const listStyle = lowerQ.includes('all') || lowerQ.includes('list') || lowerQ.includes('offers') || lowerQ.includes('types')
      ? 'JobFind gigs usually include short tasks, freelance projects, micro-jobs, and skill-based assignments. They vary by category, deadline, and payout.'
      : 'Gigs on JobFind are short-term tasks or project assignments with a clear deliverable, deadline, and usually a payout. You can browse the gigs section and filter by category, location, and skill.';

    return listStyle;
  }

  if (mergedContext.includes('post job') || mergedContext.includes('publish job') || mergedContext.includes('hire') || mergedContext.includes('recruiter')) {
    if (isRecruiter) {
      return `As a recruiter, go to Post a Job, add the title, location, responsibilities, requirements, and salary, then publish it. You can update, delete, or review applicants from the same section.`;
    }

    return 'Posting a job is a recruiter workflow: define the role, add location and requirements, and publish it so candidates can discover it.';
  }

  if (mergedContext.includes('apply') || mergedContext.includes('application')) {
    if (isSeeker) {
      return `As a seeker, open the job listing, review the requirements, make sure your profile is complete, and click Apply. You can track progress in the Applications section.`;
    }

    return 'Job seekers apply from each listing, while recruiters review submissions and track progress from the recruitment dashboard.';
  }

  if (mergedContext.includes('search') || mergedContext.includes('find job') || mergedContext.includes('job search')) {
    if (isSeeker) {
      return 'Open the Find Jobs section, filter by category, work type, and location, then review the matches that fit your profile and preferences.';
    }

    return 'Candidates can browse jobs using category, location, and work-type filters to find the most suitable matches for their profile.';
  }

  if (mergedContext.includes('premium') || mergedContext.includes('campay') || mergedContext.includes('payment') || mergedContext.includes('subscribe')) {
    return 'Premium improves visibility and reach. The payment flow is handled through Campay from the subscription or billing section, where you can complete the transaction securely.';
  }

  if (mergedContext.includes('profile') || mergedContext.includes('resume') || mergedContext.includes('edit profile')) {
    if (isSeeker) {
      return 'Update your location, skills, work type, summary, and resume so recruiters can match you more accurately for relevant opportunities.';
    }

    return 'Update your company information, work categories, and profile details to help candidates see the right information clearly.';
  }

  if (mergedContext.includes('password') || mergedContext.includes('change password')) {
    return 'Open Settings, go to Account & Security, and use the Change password option to update it securely.';
  }

  if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey')) {
    return `Hello ${userName}! I can help with job searches, applications, profile updates, gig listings, recruiter workflows, and premium plans. Ask me one clear question and I’ll answer it directly.`;
  }

  if (lowerQ.includes('thanks') || lowerQ.includes('thank you')) {
    return 'You’re welcome. I can help with job searches, gig posts, applications, recruiter tasks, or profile updates whenever you need support.';
  }

  if (lowerQ.includes('location') || lowerQ.includes('city') || lowerQ.includes('where')) {
    return 'Location matters for matching jobs to candidates. Add your city or preferred area in your profile and job listings so the platform can compare local opportunities correctly.';
  }

  const topicHint = lowerQ.includes('all') || lowerQ.includes('list') || lowerQ.includes('offers') ? 'Based on the context you gave me, the most relevant JobFind feature is' : 'Based on your message, the most relevant JobFind action is';
  return `${topicHint} ${isRecruiter ? 'recruiter management and job publishing' : isSeeker ? 'job discovery and application tracking' : 'job search and profile support'}. I can guide you through that step in more detail if you want a specific workflow.`;
}

export function buildSystemPrompt(userName = 'Guest', userRole = 'visitor') {
  return `You are JobFind AI Assistant for a job platform. Answer the user's exact question and do not guess hidden intent. If the question is unclear, ask for a brief clarification instead of assuming. Keep the response relevant to the actual request, concise, helpful, and professional. Use the user role and recent conversation context to guide the answer. The current user is ${userName} and their role is ${userRole}. Focus on the exact question asked and respond accordingly.`;
}

export function buildGeminiRequestPayload({ query, userRole = 'visitor', userName = 'Guest', conversation = [] }) {
  const safeConversation = Array.isArray(conversation)
    ? conversation
        .filter((item) => item && typeof item.text === 'string' && item.text.trim())
        .slice(-12)
        .map((item) => ({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: String(item.text).trim() }],
        }))
    : [];

  return {
    systemInstruction: {
      parts: [{ text: buildSystemPrompt(userName, userRole) }],
    },
    generationConfig: {
      temperature: 0.25,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 700,
      candidateCount: 1,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
    contents: [
      ...safeConversation,
      {
        role: 'user',
        parts: [{ text: String(query || '').trim() || 'Please answer my question clearly.' }],
      },
    ],
  };
}

export function extractGeminiReply(payload) {
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  if (!text) {
    return 'I am here to help with your question.';
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed.reply === 'string' && parsed.reply.trim()) {
      return parsed.reply.trim();
    }
    if (typeof parsed.answer === 'string' && parsed.answer.trim()) {
      return parsed.answer.trim();
    }
  } catch {
    // Ignore JSON parsing failure and fall through to plain text.
  }

  return text;
}

export function buildGeminiHealthResponse(model = 'gemini-2.0-flash') {
  return {
    status: 'ok',
    provider: 'gemini',
    model,
    timestamp: new Date().toISOString(),
  };
}
