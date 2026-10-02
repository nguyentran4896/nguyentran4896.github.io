export const site = {
  title: "Nguyen Tran — Senior Engineer & AI Researcher",
  description:
    "Senior Software Engineer with ~10 years building production systems, researching medical AI and computer vision. Bridging AI research with real-world impact.",
}

export const nav = {
  brand: "Nguyen Tran",
  status: "Open to collaborations",
  links: [
    { label: "About", href: "/#about" },
    { label: "Experience", href: "/#experience" },
    { label: "Work", href: "/#work" },
    { label: "Writing", href: "/#writing" },
    { label: "Contact", href: "/#contact" },
  ],
}

export const hero = {
  greeting: "Hello, I\u2019m Nguyen.",
  lead: "Whatever you want to know about my work, start here.",
  placeholder: "Ask about my work or research\u2026",
  submit: "Ask",
  prompts: [
    "What do you do?",
    "Tell me about your medical AI research",
    "Where have you worked?",
    "How can I get in touch?",
  ],
  note: "Answers come from this site only, matched in your browser. No AI model, no tracking, nothing leaves your device.",
}

export const ask = {
  title: "Ask about Nguyen",
  empty:
    "I couldn\u2019t find that on this site. Try one of these, or email Nguyen directly.",
  sources: "Sources",
  dialogHint: "Esc to close",
  followups: ["What do you do?", "Show me your work", "Are you available for work?", "What do you write about?"],
}

export const quick = {
  eyebrow: "Quick access",
  title: "Start with what you need.",
  tiles: [
    { icon: "Briefcase", label: "Experience", blurb: "Ten years, three companies, 300k+ businesses.", href: "#experience", tint: "sand" },
    { icon: "FlaskConical", label: "Research & work", blurb: "Medical AI for ophthalmology.", href: "#work", tint: "sage" },
    { icon: "PenLine", label: "Writing", blurb: "Notes on quiet software and AI.", href: "#writing", tint: "sky" },
    { icon: "Award", label: "Recognition", blurb: "2nd Prize, Global Ortho-K 2025.", href: "#recognition", tint: "blush" },
    { icon: "Mail", label: "Get in touch", blurb: "Collaborations and consulting.", href: "#contact", tint: "sand" },
    { icon: "Github", label: "Open source", blurb: "538+ merged pull requests.", href: "https://github.com/nguyentran4896", tint: "sage" },
  ],
}

export const about = {
  eyebrow: "About",
  title: "Engineer first. Researcher by conviction.",
  paragraphs: [
    "I\u2019ve built production systems for a decade, most recently distributed payroll services at Employment Hero. In parallel I research medical AI and computer vision, with a focus on model interpretability and generalisation across diverse datasets.",
    "I believe AI doesn\u2019t replace engineers, it amplifies them. My work is translating research into scalable, deployable systems that people can rely on.",
  ],
  facts: [
    { label: "Based in", value: "Ho Chi Minh City, Vietnam" },
    { label: "Currently", value: "Senior Software Engineer, Employment Hero" },
    { label: "Focus", value: "Medical AI, computer vision" },
    { label: "Education", value: "Computer Science, HCMUT" },
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
  eyebrow: "Experience",
  title: "A decade of shipping, then research.",
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
  items: [
    { value: "10+", label: "Years engineering" },
    { value: "538+", label: "Merged pull requests" },
    { value: "300k+", label: "Businesses served" },
    { value: "70%", label: "AI-assisted workflow" },
  ],
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
  eyebrow: "Selected work",
  title: "Research and systems.",
  projects: [
    {
      title: "HiHorus",
      tags: ["Medical AI", "Ophthalmology", "Diagnostics"],
      year: "2024 \u2014 2025",
      image: "/works/hihorus-editorial.jpg",
      summary:
        "AI-powered diagnostic platform for ophthalmology. Detects pathologic myopia and segments lesions on fundus images using deep learning.",
      stack: "PyTorch \u00b7 TensorFlow \u00b7 OpenCV \u00b7 React",
      href: "https://github.com/nguyentran4896",
      achievement: "2nd Prize \u2014 Global Ortho-K Conference 2025",
    },
    {
      title: "Retinal OCT Classification",
      tags: ["Deep Learning", "Computer Vision", "Healthcare"],
      year: "2024",
      image: "/works/retinal-oct-editorial.jpg",
      summary:
        "Multi-class CNN models for automated retinal disease detection from OCT scans. Optimised for production and deployed as a Flask REST API.",
      stack: "Python \u00b7 CNN \u00b7 Flask \u00b7 Waitress",
      href: "https://github.com/nguyentran4896",
    },
  ] satisfies Project[],
}

export const writing = {
  eyebrow: "Writing",
  title: "Notes and essays.",
  all: "All writing",
}

export const recognition = {
  eyebrow: "Recognition",
  title: "Honors and inquiry.",
  award: {
    place: "2nd Prize",
    event: "5th Global Orthokeratology \u2014 Myopia Control Conference",
    date: "August 2025",
    paper:
      "Artificial Intelligence Model for Detecting Pathologic Myopia and Segmenting Lesions on Fundus Images",
    follow: "Presented at Vietnam Ophthalmology Conference VOS \u2014 November 2025",
  },
  interests: [
    "Deep Learning Architectures",
    "Computer Vision",
    "Healthcare AI",
    "Model Interpretability",
    "Scalable ML Systems",
  ],
  languages: [
    { name: "English", level: "Professional \u00b7 TOEIC 820" },
    { name: "Vietnamese", level: "Native" },
  ],
  quote:
    "AI is not replacing developers \u2014 it\u2019s amplifying our capabilities. I use AI as a collaborative tool to focus on high-level problem-solving while automating the routine.",
}

export const tech = {
  eyebrow: "Toolbox",
  items: [
    "Ruby on Rails", "TypeScript", "Python", "PyTorch", "TensorFlow", "OpenCV",
    "PostgreSQL", "AWS", "Docker", "Redis", "Node.js", "Keras", "Kubernetes", "Java",
  ],
}

export const footer = {
  eyebrow: "Contact",
  heading: "Let\u2019s build something careful.",
  lead: "Open to research collaborations, consulting and senior engineering conversations.",
  email: "nguyentran4896@gmail.com",
  location: "Ho Chi Minh City \u00b7 Vietnam",
  socials: [
    { label: "GitHub", href: "https://github.com/nguyentran4896" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nguyentran4896" },
    { label: "ORCID", href: "https://orcid.org/0009-0003-6853-4316" },
  ],
}

/**
 * Hand-written answers for the on-site "Ask". Each entry is retrieved by
 * keyword match (see lib/ask.ts) and rendered with a link back to the section
 * it was drawn from. Article and project entries are generated from the
 * content above at build time (lib/knowledge.ts).
 */
export type Fact = {
  id: string
  title: string
  keywords: string
  answer: string
  href: string
  source: string
}

export const facts: Fact[] = [
  {
    id: "overview",
    title: "What Nguyen does",
    keywords: "what do you do who are you nguyen about intro summary profession job role engineer researcher background",
    answer:
      "Nguyen Tran is a senior software engineer with about ten years of experience building production systems, and an AI researcher focused on medical AI and computer vision. He translates research into scalable, deployable systems.",
    href: "/#about",
    source: "About",
  },
  {
    id: "current-role",
    title: "Current role",
    keywords: "current job role company employer work now present employment hero payroll senior software engineer",
    answer:
      "Since 2021 Nguyen has been a Senior Software Engineer at Employment Hero, designing distributed payroll services used by 300,000+ businesses across 5 countries and leading integration of AI tooling across engineering.",
    href: "/#experience",
    source: "Experience",
  },
  {
    id: "career",
    title: "Career history",
    keywords: "experience career history worked where companies employers past jobs vng zalo nguyen hiep resume cv timeline",
    answer:
      "Employment Hero (2021 to now, Senior Software Engineer), VNG Corporation (2018 to 2020, Zalo Web Login authentication for millions of daily users) and Nguyen Hiep Software (2017 to 2018, MEAN stack web apps on AWS).",
    href: "/#experience",
    source: "Experience",
  },
  {
    id: "research",
    title: "Medical AI research",
    keywords: "research medical ai ophthalmology myopia fundus lesion segmentation deep learning hihorus eye pathologic computer vision",
    answer:
      "Nguyen researches medical AI for ophthalmology. His HiHorus platform detects pathologic myopia and segments lesions on fundus images using deep learning, and won 2nd Prize at the 5th Global Ortho-K & Myopia Conference in 2025.",
    href: "/#work",
    source: "Selected work",
  },
  {
    id: "award",
    title: "Awards and publications",
    keywords: "award prize publication paper conference published recognition honors presented speaking vos ortho-k",
    answer:
      "2nd Prize at the 5th Global Orthokeratology and Myopia Control Conference (August 2025) for a model that detects pathologic myopia and segments lesions on fundus images, later presented at the Vietnam Ophthalmology Conference, November 2025.",
    href: "/#recognition",
    source: "Recognition",
  },
  {
    id: "stack",
    title: "Technology",
    keywords: "tech stack technologies languages tools skills framework python typescript ruby rails pytorch tensorflow aws kubernetes postgres",
    answer:
      "Day to day: Ruby on Rails, TypeScript, PostgreSQL, Kubernetes and AWS. For research: Python, PyTorch, TensorFlow, Keras and OpenCV. Earlier work includes Java microservices and the MEAN stack.",
    href: "/#experience",
    source: "Experience",
  },
  {
    id: "ai-view",
    title: "Views on AI",
    keywords: "ai opinion view philosophy replace developers amplify assisted workflow copilot llm tools productivity",
    answer:
      "Nguyen believes AI doesn\u2019t replace engineers, it amplifies them. Roughly 70% of his workflow is AI-assisted, which frees him to focus on high-level problem solving while automating the routine.",
    href: "/#recognition",
    source: "Recognition",
  },
  {
    id: "interpretability",
    title: "Interpretability and generalisation",
    keywords: "interpretability generalisation generalization explainability datasets models robustness",
    answer:
      "A core research interest: making vision models explainable and checking that they generalise across diverse datasets, not only the one they were trained on.",
    href: "/#about",
    source: "About",
  },
  {
    id: "numbers",
    title: "By the numbers",
    keywords: "numbers stats statistics years pull requests prs github contributions open source businesses countries",
    answer:
      "10+ years engineering, 538+ merged pull requests, 300,000+ businesses served and a roughly 70% AI-assisted workflow.",
    href: "/#about",
    source: "About",
  },
  {
    id: "education",
    title: "Education and languages",
    keywords: "education degree university school study hcmut gpa language english vietnamese toeic speak",
    answer:
      "Engineering degree in Computer Science from Ho Chi Minh University of Technology (HCMUT), 2014 to 2018. Nguyen speaks Vietnamese natively and English professionally (TOEIC 820).",
    href: "/#experience",
    source: "Experience",
  },
  {
    id: "location",
    title: "Location",
    keywords: "where location based live city country timezone remote vietnam saigon ho chi minh",
    answer:
      "Nguyen is based in Ho Chi Minh City, Vietnam and works remotely.",
    href: "/#contact",
    source: "Contact",
  },
  {
    id: "availability",
    title: "Availability",
    keywords: "available availability hire hiring freelance consulting collaborate collaboration open work together engage",
    answer:
      "Nguyen is open to research collaborations, consulting and senior engineering conversations. The quickest route is email.",
    href: "/#contact",
    source: "Contact",
  },
  {
    id: "contact",
    title: "Contact",
    keywords: "contact email reach message talk linkedin github orcid get in touch social hello connect",
    answer:
      "Email nguyentran4896@gmail.com, or find Nguyen on GitHub (nguyentran4896), LinkedIn (nguyentran4896) and ORCID.",
    href: "/#contact",
    source: "Contact",
  },
]
