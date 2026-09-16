export interface ChatChannel {
  id: string;
  seekerId: string;
  seekerName: string;
  recruiterId: string;
  recruiterName: string;
  lastMessage: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

const CHANNELS_KEY = "jf_chat_channels";
const MESSAGES_KEY = "jf_chat_messages";

export function getChannels(userId: string, role: "seeker" | "recruiter" | string): ChatChannel[] {
  try {
    const stored = localStorage.getItem(CHANNELS_KEY);
    let channels: ChatChannel[] = stored ? JSON.parse(stored) : [];
    
    // If no channels exist, initialize defaults
    if (channels.length === 0) {
      channels = initializeDefaultChannels(userId, role);
    }
    
    // Filter channels that belong to this user
    if (role === "recruiter") {
      return channels.filter((c) => c.recruiterId === userId);
    } else {
      return channels.filter((c) => c.seekerId === userId);
    }
  } catch {
    return [];
  }
}

export function saveChannels(channels: ChatChannel[]): void {
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
}

export function getMessages(channelId: string): ChatMessage[] {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    let messages: ChatMessage[] = stored ? JSON.parse(stored) : [];
    
    // If no messages exist, check if there are defaults for this channel
    if (messages.length === 0) {
      messages = getDefaultMessages();
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
    
    return messages.filter((m) => m.channelId === channelId);
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function sendMessage(
  channelId: string,
  senderId: string,
  senderName: string,
  text: string
): ChatMessage {
  const messages = (() => {
    try {
      const stored = localStorage.getItem(MESSAGES_KEY);
      return stored ? JSON.parse(stored) : getDefaultMessages();
    } catch {
      return [];
    }
  })();

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    channelId,
    senderId,
    senderName,
    text,
    createdAt: new Date().toISOString(),
  };

  const updatedMessages = [...messages, newMessage];
  saveMessages(updatedMessages);

  // Update last message in channel
  const channels = (() => {
    try {
      const stored = localStorage.getItem(CHANNELS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const updatedChannels = channels.map((channel: ChatChannel) => {
    if (channel.id === channelId) {
      return {
        ...channel,
        lastMessage: text,
        updatedAt: newMessage.createdAt,
      };
    }
    return channel;
  });
  saveChannels(updatedChannels);

  // Dispatch custom event to notify tabs
  window.dispatchEvent(new Event("jf-chats-updated"));

  return newMessage;
}

export function createChannel(
  seekerId: string,
  seekerName: string,
  recruiterId: string,
  recruiterName: string
): ChatChannel {
  const channels = (() => {
    try {
      const stored = localStorage.getItem(CHANNELS_KEY);
      return stored ? (JSON.parse(stored) as ChatChannel[]) : [];
    } catch {
      return [];
    }
  })();

  const existing = channels.find(
    (c) => c.seekerId === seekerId && c.recruiterId === recruiterId
  );

  if (existing) {
    return existing;
  }

  const newChannel: ChatChannel = {
    id: `channel-${Date.now()}`,
    seekerId,
    seekerName,
    recruiterId,
    recruiterName,
    lastMessage: "No messages yet.",
    updatedAt: new Date().toISOString(),
  };

  saveChannels([newChannel, ...channels]);
  window.dispatchEvent(new Event("jf-chats-updated"));
  return newChannel;
}

function initializeDefaultChannels(userId: string, role: string): ChatChannel[] {
  const defaultChannels: ChatChannel[] = [];
  
  if (role === "seeker") {
    defaultChannels.push(
      {
        id: "channel-default-1",
        seekerId: userId,
        seekerName: "Job Seeker",
        recruiterId: "recruiter-technova",
        recruiterName: "TechNova",
        lastMessage: "Hello! We reviewed your application and would love to schedule a quick chat. What is your availability this week?",
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "channel-default-2",
        seekerId: userId,
        seekerName: "Job Seeker",
        recruiterId: "recruiter-digitalhub",
        recruiterName: "Digital Hub",
        lastMessage: "Hi! Thanks for saving our UI/UX position. Do you have any questions about the role?",
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      }
    );
  } else if (role === "recruiter") {
    defaultChannels.push(
      {
        id: "channel-default-3",
        seekerId: "seeker-emmanuel",
        seekerName: "Emmanuel Mbarga",
        recruiterId: userId,
        recruiterName: "Recruiter Workspace",
        lastMessage: "Hi! I just applied to your Frontend Developer opening and wanted to introduce myself. Looking forward to your response.",
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "channel-default-4",
        seekerId: "seeker-cynthia",
        seekerName: "Cynthia Njoya",
        recruiterId: userId,
        recruiterName: "Recruiter Workspace",
        lastMessage: "Hello, I wanted to inquire about the remote work policy for your design job.",
        updatedAt: new Date(Date.now() - 5400000).toISOString(),
      }
    );
  }
  
  saveChannels(defaultChannels);
  return defaultChannels;
}

function getDefaultMessages(): ChatMessage[] {
  return [
    {
      id: "m-1",
      channelId: "channel-default-1",
      senderId: "recruiter-technova",
      senderName: "TechNova",
      text: "Hello! We reviewed your application and would love to schedule a quick chat. What is your availability this week?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "m-2",
      channelId: "channel-default-2",
      senderId: "recruiter-digitalhub",
      senderName: "Digital Hub",
      text: "Hi! Thanks for saving our UI/UX position. Do you have any questions about the role?",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "m-3",
      channelId: "channel-default-3",
      senderId: "seeker-emmanuel",
      senderName: "Emmanuel Mbarga",
      text: "Hi! I just applied to your Frontend Developer opening and wanted to introduce myself. Looking forward to your response.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "m-4",
      channelId: "channel-default-4",
      senderId: "seeker-cynthia",
      senderName: "Cynthia Njoya",
      text: "Hello, I wanted to inquire about the remote work policy for your design job.",
      createdAt: new Date(Date.now() - 5400000).toISOString(),
    }
  ];
}
