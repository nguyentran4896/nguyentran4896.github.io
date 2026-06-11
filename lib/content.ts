export const site = {
  title: "Nguyen Tran — Senior Engineer & AI Researcher",
  description:
    "Senior Software Engineer with ~10 years building production systems, researching medical AI and computer vision. Bridging AI research with real-world impact.",
}

export const hero = {
  topLabel: "01 — ENGINEERING",
  topTitleLine1: "SENIOR",
  topTitleLine2: "ENGINEER",
  bottomLabel: "02 — RESEARCH",
  bottomTitleLine1: "AI",
  bottomTitleLine2: "RESEARCHER",
  cta: "Initialize",
}

export const about = {
  sectionLabel: "03 — PHILOSOPHY",
  sectionTitle: "Stream of Consciousness",
  statements: [
    "I've built production systems for a decade.",
    "I research medical AI and computer vision.",
    "Published at the 5th Global Ortho-K & Myopia Conference, 2025.",
    "AI doesn't replace engineers — it amplifies them.",
    "I translate research into scalable, deployable systems.",
    "I explore model interpretability and generalisation across diverse datasets.",
  ],
}

export type Highlight = { icon: string; value: string; label: string }

export type Role = {
  period: string
  role: string
  company: string
  location: string
  icon: string
  summary: string
  bullets: string[]
  stack: string[]
  highlights?: Highlight[]
}

export const experience = {
  sectionLabel: "04 — TRAJECTORY",
  sectionTitle: "Career & Education",
  roles: [
    {
      period: "2021 — Present",
      role: "Senior Software Engineer",
      company: "Employment Hero",
      location: "Remote · Vietnam",
      icon: "Server",
      summary:
        "Designing scalable backend systems serving 300,000+ businesses across 5 countries. Leading architectural decisions for distributed payroll services and integrating AI tooling across the engineering organisation.",
      bullets: [
        "Lead technical research and architectural decision-making for complex distributed payroll systems",
        "Integrate AI tools into development workflows to enhance code quality and team productivity",
        "Implement CI/CD pipelines using GitHub Actions and CircleCI for automated testing and deployment",
      ],
      stack: ["Ruby on Rails", "TypeScript", "PostgreSQL", "Kubernetes", "AWS"],
      highlights: [
        { icon: "Users", value: "300k+", label: "Businesses served" },
        { icon: "Globe", value: "5", label: "Countries" },
        { icon: "Sparkles", value: "AI", label: "Tooling lead" },
      ],
    },
    {
      period: "2018 — 2020",
      role: "Software Engineer",
      company: "VNG Corporation",
      location: "Ho Chi Minh City",
      icon: "ShieldCheck",
      summary:
        "Architected the full-stack authentication system for Zalo Web Login (millions of daily active users). Built Java microservices, REST APIs, and observability tooling for anomaly detection.",
      bullets: [
        "Designed logging, error-tracking, and statistical analysis systems for monitoring and anomaly detection",
        "Integrated authentication across multiple platforms; addressed web security challenges and data protection",
        "Built Java server-side applications using microservices architecture and RESTful APIs",
      ],
      stack: ["Java", "Microservices", "REST", "Monitoring"],
      highlights: [
        { icon: "Users", value: "Millions", label: "Daily active users" },
        { icon: "Lock", value: "Auth", label: "Web Login system" },
        { icon: "Activity", value: "24/7", label: "Observability" },
      ],
    },
    {
      period: "2017 — 2018",
      role: "Web Developer",
      company: "Nguyen Hiep Software",
      location: "Ho Chi Minh City",
      icon: "Code2",
      summary:
        "Built full-stack web applications on the MEAN stack. Deployed scalable backend services on AWS for early-stage commerce products.",
      bullets: [
        "Built scalable backend services with Node.js, RESTful APIs, and AWS cloud infrastructure",
        "Applied Agile/Scrum methodologies and automated testing for continuous delivery",
      ],
      stack: ["MongoDB", "Express", "Angular", "Node.js"],
      highlights: [
        { icon: "Cloud", value: "AWS", label: "Cloud delivery" },
        { icon: "Repeat", value: "Agile", label: "CI · automated tests" },
      ],
    },
  ] satisfies Role[],
  education: {
    period: "2014 — 2018",
    degree: "Engineering Degree, Computer Science",
    school: "Ho Chi Minh University of Technology (HCMUT)",
    note: "GPA 7.22 / 10.0",
  },
}

export const stats = {
  sectionLabel: "05 — BY THE NUMBERS",
  items: [
    { value: "10+", label: "Years Engineering" },
    { value: "538+", label: "Merged Pull Requests" },
    { value: "300k+", label: "Businesses Served" },
    { value: "70%", label: "AI-Assisted Workflow" },
  ],
}

export const contributions = {
  label: "GitHub Activity",
  caption: "in the last year",
}

export type Project = {
  title: string
  tags: string[]
  image: string
  year: string
  summary: string
  stack: string
  href: string
  achievement?: string
}

export const works = {
  sectionLabel: "06 — SELECTED WORKS",
  sectionTitle: "Research & Systems",
  projects: [
    {
      title: "HiHorus",
      tags: ["Medical AI", "Ophthalmology", "Diagnostics"],
      year: "2024 — 2025",
      image: "/works/hihorus-editorial.jpg",
      summary:
        "AI-powered diagnostic platform for ophthalmology. Detects pathologic myopia and segments lesions on fundus images using deep learning.",
      stack: "PyTorch · TensorFlow · OpenCV · React",
      href: "https://github.com/nguyentran4896",
      achievement: "2nd Prize — Global Ortho-K Conference 2025",
    },
    {
      title: "Retinal OCT Classification",
      tags: ["Deep Learning", "Computer Vision", "Healthcare"],
      year: "2024",
      image: "/works/retinal-oct-editorial.jpg",
      summary:
        "Multi-class CNN models for automated retinal disease detection from OCT scans. Optimised for production and deployed as a Flask REST API.",
      stack: "Python · CNN · Flask · Waitress",
      href: "https://github.com/nguyentran4896",
    },
  ] satisfies Project[],
}

export const recognition = {
  sectionLabel: "07 — RECOGNITION",
  sectionTitle: "Honors & Inquiry",
  award: {
    place: "2nd Prize",
    event: "5th Global Orthokeratology — Myopia Control Conference",
    date: "August 2025",
    paper:
      "Artificial Intelligence Model for Detecting Pathologic Myopia and Segmenting Lesions on Fundus Images",
    follow: "Presented at Vietnam Ophthalmology Conference VOS — November 2025",
  },
  interests: [
    "Deep Learning Architectures",
    "Computer Vision",
    "Healthcare AI",
    "Model Interpretability",
    "Scalable ML Systems",
  ],
  languages: [
    { name: "English", level: "Professional · TOEIC 820" },
    { name: "Vietnamese", level: "Native" },
  ],
  quote:
    "AI is not replacing developers — it's amplifying our capabilities. I use AI as a collaborative tool to focus on high-level problem-solving while automating the routine.",
}

export const latentField = {
  eyebrow: "08 — LATENT SPACE",
  heading: "Generative field",
  captionPrefix: "SEED",
  captionSuffix: "— WEIGHTS RE-ROLLED FOR YOU",
  rerollLabel: "REROLL",
  subCaption: "CPPN · 5 TANH LAYERS · 16 NEURONS · DRIFT ACTIVE",
} as const

export const particleMonogram = {
  text: "NGUYEN TRAN",
  ariaLabel: "Nguyen Tran — particle monogram",
} as const

export const contactGlobe = {
  caption: "COORDINATES — 10.776 N · 106.700 E · SAIGON",
  eyebrow: "SIGNAL FROM SAIGON",
} as const

export const footprint = {
  eyebrow: "FOOTPRINT",
  title: "Where the work lives",
  caption: "Built across two cities, shipped to the world.",
  cities: [
    { id: "hcmc", name: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, coords: "10°49′N 106°37′E" },
    { id: "sydney", name: "Sydney", lat: -33.8688, lng: 151.2093, coords: "33°52′S 151°12′E" },
  ],
} as const

export const tokenizerPlayground = {
  eyebrow: "10 — TOKENS",
  heading: "Tokenizer Playground",
  intro:
    "Paste any text and watch it decompose into BPE tokens in real time. Toggle encodings, reveal token IDs, and see how the model actually reads language.",
  inputLabel: "INPUT TEXT",
  inputPlaceholder: "Type or paste text to tokenize…",
  countLabel: "TOKEN COUNT",
  charLabel: "CHAR COUNT",
  encodingLabel: "ENCODING",
  idsToggle: "IDS",
  examples: [
    { label: "emoji", text: "Hello 😊 World 🌍 AI 🤖" },
    { label: "leading space", text: " token vs token" },
    { label: "banh mi", text: "banh mi" },
  ],
} as const

export const physicsChips = {
  eyebrow: "TECHNICAL ARSENAL",
  resetLabel: "RESET",
} as const

export const embeddingAtlas = {
  eyebrow: "10 — ATLAS",
  heading: "Latent space of the writing",
  cornerLabel: "LATENT — MINILM-L6 · PCA",
  kindLabels: {
    "post-para": "ARTICLE",
    work: "WORK",
    about: "BIO",
  } as Record<string, string>,
} as const

export const worksGallery = {
  scrollHint: "SCROLL TO EXPLORE",
  viewProject: "VIEW PROJECT",
} as const

export const tech = {
  sectionLabel: "09 — TECHNICAL ARSENAL",
  techItems: [
    "RUBY ON RAILS",
    "TYPESCRIPT",
    "PYTHON",
    "PYTORCH",
    "TENSORFLOW",
    "OPENCV",
    "POSTGRESQL",
    "AWS",
    "DOCKER",
    "REDIS",
    "NODE.JS",
    "KERAS",
  ],
  concepts: [
    "DEEP LEARNING",
    "COMPUTER VISION",
    "MEDICAL AI",
    "DISTRIBUTED SYSTEMS",
    "INTERPRETABILITY",
    "SCALABLE BACKEND",
    "AI-ASSISTED DEV",
  ],
}

export const footer = {
  heading1: "Let's",
  heading2: "Collaborate",
  email: "nguyentran4896@gmail.com",
  location: "HO CHI MINH CITY · VIETNAM",
  socials: [
    { label: "GitHub", href: "https://github.com/nguyentran4896" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nguyentran4896" },
    { label: "ORCID", href: "https://orcid.org/0009-0003-6853-4316" },
    { label: "Email", href: "mailto:nguyentran4896@gmail.com" },
  ],
}

export const onDeviceChat = {
  trigger: "CHAT — ON-DEVICE",
  close: "CLOSE",
  eyebrow: "00 — ON-DEVICE LLM",
  heading: "Ask about Nguyen.",
  disclaimer:
    "Runs entirely in your browser via WebGPU. One-time ~190 MB model download, cached for repeat visits. Nothing you type leaves this page — watch the network tab.",
  loadBtn: "LOAD MODEL (190 MB)",
  cancelBtn: "NOT NOW",
  webgpuMissing: "REQUIRES WEBGPU — RECENT DESKTOP BROWSER",
  loadingPrefix: "LOADING",
  readyMsg: "Model loaded. Ask me anything about Nguyen.",
  placeholder: "Type a question…",
  sendLabel: "SEND",
  loadingLabel: "LOADING…",
  errorPrefix: "ERROR:",
  inputAriaLabel: "Chat input",
  closeAriaLabel: "Close chat",
  dialogAriaLabel: "On-device chat about Nguyen Tran",
} as const

export const ping = {
  header: "ROUGH RTT — BROWSER FETCH, NOT ICMP",
} as const

export const nav = {
  brand: "NGUYEN TRAN",
  status: "AVAILABLE FOR WORK",
  links: [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Works", href: "#works" },
    { label: "Writing", href: "/blog" },
    { label: "Contact", href: "#contact" },
  ],
}
