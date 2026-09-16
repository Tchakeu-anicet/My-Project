export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export const JOBS_DATABASE: Job[] = [
  {
    id: "job-1",
    title: "Frontend Developer (React)",
    company: "TechNova",
    location: "Yaoundé, Cameroon",
    type: "Full-time",
    salary: "350,000 - 550,000 XAF",
    category: "IT & Networking",
    description: "We are looking for a talented Frontend Developer to build clean, responsive user interfaces for our enterprise SaaS product. You will collaborate closely with designers and product managers to translate Figma concepts into performant React code.",
    requirements: [
      "2+ years of professional web development experience.",
      "Proficient in React, TypeScript, modern CSS (Flexbox/Grid).",
      "Familiarity with state management libraries like Redux or Zustand.",
      "Good understanding of RESTful APIs and asynchronous code."
    ],
    responsibilities: [
      "Develop new user-facing features using React and TypeScript.",
      "Build reusable components and front-end libraries for future use.",
      "Optimize applications for maximum speed, accessibility, and scalability.",
      "Collaborate with backend developers to integrate APIs."
    ]
  },
  {
    id: "job-2",
    title: "UI/UX Designer",
    company: "Digital Hub",
    location: "Douala, Cameroon",
    type: "Hybrid",
    salary: "300,000 - 500,000 XAF",
    category: "Design",
    description: "Join our design studio and help create beautiful, intuitive experiences for mobile and web applications. You will conduct user research, construct wireframes, and design high-fidelity prototypes.",
    requirements: [
      "Proven experience as a UI/UX Designer with a strong portfolio.",
      "Proficiency in Figma and Adobe Creative Suite.",
      "Experience conducting user interviews and usability testing.",
      "Basic understanding of HTML/CSS is a plus."
    ],
    responsibilities: [
      "Gather and evaluate user requirements in collaboration with product managers.",
      "Illustrate design ideas using storyboards, process flows, and sitemaps.",
      "Design graphic user interface elements, like menus, tabs, and widgets.",
      "Develop UI mockups and prototypes that clearly illustrate how sites function."
    ]
  },
  {
    id: "job-3",
    title: "Full Stack Software Engineer",
    company: "CamTech Labs",
    location: "Yaoundé, Cameroon",
    type: "Full-time",
    salary: "450,000 - 700,000 XAF",
    category: "Engineering",
    description: "CamTech Labs is seeking a Full Stack Software Engineer to join our growing engineering team. You will work on both frontend React interfaces and backend Node.js APIs, building scalable solutions.",
    requirements: [
      "3+ years of experience with Node.js and React.",
      "Strong skills in relational databases (MySQL, PostgreSQL) and SQL.",
      "Experience with cloud services (AWS or Google Cloud) is preferred.",
      "Strong problem-solving and algorithmic skills."
    ],
    responsibilities: [
      "Design, develop, test, and deploy software services.",
      "Write clean, maintainable, and well-documented code.",
      "Design database schemas and optimize query performance.",
      "Participate in code reviews and mentor junior developers."
    ]
  },
  {
    id: "job-4",
    title: "Sales & Marketing Manager",
    company: "MarketPro",
    location: "Douala, Cameroon",
    type: "Full-time",
    salary: "300,000 - 600,000 XAF",
    category: "Sales & Marketing",
    description: "MarketPro is looking for an energetic and strategic Sales & Marketing Manager to drive customer acquisition and manage corporate client partnerships across Cameroon.",
    requirements: [
      "Degree in Business Administration, Marketing, or a related field.",
      "3+ years of experience in sales, account management, or B2B marketing.",
      "Strong communication and negotiation skills in English and French.",
      "Ability to meet and exceed monthly sales targets."
    ],
    responsibilities: [
      "Develop and implement strategic marketing plans to achieve business goals.",
      "Identify new business leads and negotiate sales contracts.",
      "Maintain strong relationships with existing corporate accounts.",
      "Track and report on sales metrics and marketing campaign ROI."
    ]
  },
  {
    id: "job-5",
    title: "HR Specialist",
    company: "PeopleFirst",
    location: "Bafoussam, Cameroon",
    type: "Part-time",
    salary: "250,000 - 400,000 XAF",
    category: "Human Resources",
    description: "We are seeking a part-time HR Specialist to manage employee onboarding, recruiting coordination, and employee relations at our regional headquarters.",
    requirements: [
      "Bachelor's degree in Human Resources or related field.",
      "Strong understanding of Cameroon labor laws.",
      "Excellent interpersonal and conflict-resolution skills.",
      "Highly organized with strong attention to detail."
    ],
    responsibilities: [
      "Manage recruitment processes, including job postings and interviews.",
      "Coordinate employee onboarding and training sessions.",
      "Handle employee relations issues and ensure compliance with labor laws.",
      "Maintain employee records and update HR policies."
    ]
  },
  {
    id: "job-6",
    title: "Data Analyst",
    company: "DataWorks",
    location: "Remote",
    type: "Contract",
    salary: "400,000 - 650,000 XAF",
    category: "Data Science",
    description: "DataWorks is hiring a contract Data Analyst to help analyze and visualize product engagement data. This is a fully remote role with flexible hours.",
    requirements: [
      "Strong skills in SQL and data manipulation.",
      "Proficient in visualization tools like Power BI or Tableau.",
      "Solid knowledge of Python (Pandas, NumPy) for data analysis.",
      "Ability to translate data findings into actionable recommendations."
    ],
    responsibilities: [
      "Write SQL queries to extract data from data warehouses.",
      "Build interactive dashboards and reports for key stakeholders.",
      "Perform exploratory data analysis to identify trends and patterns.",
      "Present analysis findings to business and technical teams."
    ]
  },
  {
    id: "job-7",
    title: "Senior Accounting Executive",
    company: "Fidelity Finance",
    location: "Douala, Cameroon",
    type: "Full-time",
    salary: "400,000 - 550,000 XAF",
    category: "Accounting",
    description: "Fidelity Finance is seeking a Senior Accounting Executive to manage corporate accounting, tax filings, and financial reporting for our clients.",
    requirements: [
      "Degree in Accounting or Finance; Professional certification (e.g. ACCA) is a plus.",
      "3+ years of experience in corporate accounting.",
      "Proficient with accounting software (Sage, QuickBooks).",
      "Detail-oriented with strong analytical capabilities."
    ],
    responsibilities: [
      "Prepare monthly and annual financial statements.",
      "Manage tax filings and ensure compliance with tax regulations.",
      "Perform bank reconciliations and manage accounts payable/receivable.",
      "Assist in budget preparation and financial auditing processes."
    ]
  },
  {
    id: "job-8",
    title: "Customer Support Specialist",
    company: "SwiftConnect",
    location: "Yaoundé, Cameroon",
    type: "Full-time",
    salary: "180,000 - 280,000 XAF",
    category: "Customer Service",
    description: "Join our client service team and assist customers with inquiries, issues, and product recommendations via chat, email, and phone.",
    requirements: [
      "Excellent verbal and written communication skills.",
      "Bilingual in French and English is highly desired.",
      "Empathy and strong problem-solving capabilities.",
      "Ability to multi-task and work in a fast-paced environment."
    ],
    responsibilities: [
      "Respond to customer inquiries in a timely and professional manner.",
      "Identify customer needs and assist them in resolving issues.",
      "Document customer interactions in our CRM system.",
      "Escalate complex issues to the appropriate technical support teams."
    ]
  }
];
