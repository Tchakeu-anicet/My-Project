export interface ChatbotRequest {
  userRole?: string;
  userName?: string;
  query: string;
  conversation?: Array<{
    sender: "user" | "bot";
    text: string;
  }>;
}

export interface ChatbotHealthStatus {
  status: "ok" | "fallback" | "error";
  provider?: string;
  model?: string;
}

const fallbackReply = (query: string, conversation: ChatbotRequest["conversation"] = []): string => {
  const q = (query ?? "").trim();

  if (!q) {
    return "I can help with job search, applications, recruiter workflows, premium features, and gig offers. Ask me a specific question and I’ll guide you clearly.";
  }

  const lowerQ = q.toLowerCase();
  const recentContext = sanitizeConversation(conversation)
    .map((message) => message.text.toLowerCase())
    .join(" ");
  const mergedContext = `${lowerQ} ${recentContext}`;

  if (lowerQ.includes("who are you") || lowerQ.includes("what are you") || lowerQ.includes("your name")) {
    return "I’m JobFind AI, your platform assistant. I help job seekers, recruiters, and employers with job search, applications, onboarding, posting jobs, gig opportunities, profile updates, and platform guidance.";
  }

  if (mergedContext.includes("gig") || mergedContext.includes("gigs") || mergedContext.includes("freelance") || mergedContext.includes("short task")) {
    if (lowerQ.includes("all") || lowerQ.includes("list") || lowerQ.includes("offers") || lowerQ.includes("types")) {
      return "JobFind gig offers usually include short-term tasks, freelance assignments, micro-jobs, and skill-based project work. They differ by category, deadline, and payout.";
    }

    return "Gigs on JobFind are short-term or project-based opportunities. They usually have a clear task, a specific deadline, and a payment or reward attached. You can browse the gigs section and filter by category, location, and skill to find a match.";
  }

  if (mergedContext.includes("post job") || mergedContext.includes("publish job") || mergedContext.includes("hire") || mergedContext.includes("recruiter")) {
    return "To post a job, open the recruiter workspace, select Post a Job, add the title, location, responsibilities, requirements, and preferred skills, then publish it. You can manage applicants and update or remove the listing from the same section.";
  }

  if (mergedContext.includes("apply") || mergedContext.includes("application")) {
    return "To apply for a role, open the job listing, review the requirements, make sure your profile is complete, then click Apply. You can monitor your application progress and status in the Applications section.";
  }

  if (mergedContext.includes("search") || mergedContext.includes("find job") || mergedContext.includes("job search")) {
    return "Use the Find Jobs section to filter by role, category, work type, and location. This helps narrow down positions that match your experience and preferences before you apply.";
  }

  if (mergedContext.includes("premium") || mergedContext.includes("campay") || mergedContext.includes("payment") || mergedContext.includes("subscribe")) {
    return "Premium gives better visibility, priority promotion, and stronger access to opportunities. To pay, use the premium subscription flow and complete the Campay checkout from your account or billing section.";
  }

  if (mergedContext.includes("profile") || mergedContext.includes("resume") || mergedContext.includes("edit profile")) {
    return "Update your profile by adding your skills, experience, preferred work type, and location. A complete profile makes you easier to match with the right jobs and recruiters.";
  }

  if (mergedContext.includes("password") || mergedContext.includes("change password")) {
    return "Open Settings, go to Account & Security, and choose Change password. That is the secure way to update your login credentials.";
  }

  if (lowerQ.includes("hello") || lowerQ.includes("hi") || lowerQ.includes("hey")) {
    return `Hello! I’m here to help with job search, applications, gigs, recruiter tasks, profiles, and premium features. Ask me something specific and I’ll answer clearly.`;
  }

  if (lowerQ.includes("thanks") || lowerQ.includes("thank you")) {
    return "You’re welcome. I can help with job searches, applications, recruiter actions, gig listings, or profile updates whenever you need me.";
  }

  const activeTopic = mergedContext.includes("gig")
    ? "gig offers"
    : mergedContext.includes("job") || mergedContext.includes("apply")
      ? "job opportunities"
      : mergedContext.includes("profile")
        ? "your profile"
        : "your platform workflow";

  return `You asked about ${activeTopic}. Based on the message context, the relevant JobFind action is to guide you through that workflow step by step, such as filtering jobs, applying, posting roles, or updating your profile.`;
};

const sanitizeConversation = (conversation: ChatbotRequest["conversation"] = []): ChatbotRequest["conversation"] => {
  return (conversation ?? [])
    .filter((message) => message && typeof message.text === "string" && message.text.trim().length > 0)
    .slice(-12)
    .map((message) => ({
      sender: message.sender,
      text: message.text.trim(),
    }));
};

export async function getChatbotHealth(): Promise<ChatbotHealthStatus> {
  const endpoint = (import.meta.env.VITE_CHATBOT_API_URL as string | undefined) || "/api/chat";
  const healthEndpoint = endpoint.replace(/\/chat$/, "/health");

  try {
    const response = await fetch(healthEndpoint, { method: "GET" });
    if (!response.ok) {
      return { status: "error" };
    }

    const data = (await response.json()) as { provider?: string; model?: string; status?: string };
    return {
      status: data.status === "ok" ? "ok" : "fallback",
      provider: data.provider,
      model: data.model,
    };
  } catch {
    return { status: "error" };
  }
}

export async function getChatbotReply(request: ChatbotRequest): Promise<string> {
  const endpoint = (import.meta.env.VITE_CHATBOT_API_URL as string | undefined) || "/api/chat";
  const safeConversation = sanitizeConversation(request.conversation);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userRole: request.userRole ?? "visitor",
        userName: request.userName ?? "Guest",
        query: request.query.trim(),
        conversation: safeConversation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      reply?: string;
      text?: string;
      message?: string;
      status?: string;
    };

    const reply = data.reply ?? data.text ?? data.message;

    if (typeof reply === "string" && reply.trim()) {
      return reply;
    }

    throw new Error("Empty AI response");
  } catch {
    return fallbackReply(request.query, request.conversation);
  }
}
