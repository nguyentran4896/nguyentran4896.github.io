export const site = {
  title: "Nguyen Tran — Senior Engineer & AI Researcher",
  description:
    "Senior engineer helping teams ship reliable backend systems and turn medical-AI research into working software. Ten years in production, award-winning eye-care AI research.",
}

export const nav = {
  brand: "Nguyen Tran",
  status: "Open to collaborations",
  cta: "Email me",
  links: [
    { label: "About", href: "/#about" },
    { label: "Work", href: "/#work" },
    { label: "Experience", href: "/#experience" },
    { label: "Writing", href: "/#writing" },
    { label: "Contact", href: "/#contact" },
  ],
}

export const hero = {
  greeting: "Hello, I\u2019m Nguyen.",
  lead: "I help teams ship reliable backend systems and turn medical-AI research into working software.",
  cta: "Email me",
  secondary: "See my work",
  placeholder: "Ask about my work or research\u2026",
  submit: "Ask",
  prompts: [
    "What do you do?",
    "Can you help with my project?",
    "Where have you worked?",
    "Show me your work",
  ],
  note: "Answers come from this site, matched in your browser.",
}

export const ask = {
  title: "Ask about Nguyen",
  empty:
    "I couldn\u2019t find that on this site. Try one of these, or email Nguyen directly.",
  sources: "Sources",
  dialogHint: "Esc to close",
  followups: ["What do you do?", "Show me your work", "Are you available for work?", "What do you write about?"],
}

/** One quiet line of proof under the hero. Each figure appears here and nowhere else on the page. */
export const proof = {
  label: "At a glance",
  items: [
    { value: "10+ years", label: "building production systems" },
    { value: "300k+", label: "businesses on systems I work on" },
    { value: "2nd Prize", label: "Global Ortho-K Conference 2025" },
  ],
}

export const about = {
  eyebrow: "About",
  title: "Engineer first, researcher by conviction.",
  paragraphs: [
    "I\u2019m a senior engineer at Employment Hero, based in Ho Chi Minh City and working remotely. Alongside that I research medical AI for eye care, and my job is the bridge between the two: taking research and turning it into systems people can rely on.",
  ],
  education: "Computer Science, Ho Chi Minh University of Technology (HCMUT) \u00b7 English (professional) and Vietnamese (native)",
}

export type Role = {
  period: string
  role: string
  company: string
  location: string
  summary: string
  bullets?: string[]
}

export const experience = {
  eyebrow: "Experience",
  title: "Ten years of shipping.",
  roles: [
    {
      period: "2021 \u2014 Present",
      role: "Senior Software Engineer",
      company: "Employment Hero",
      location: "Remote \u00b7 Vietnam",
      summary:
        "Backend systems for payroll used by 300,000+ businesses across 5 countries.",
      bullets: [
        "Lead architecture decisions for distributed payroll services",
        "Brought AI tooling into the engineering workflow across teams",
      ],
    },
    {
      period: "2018 \u2014 2020",
      role: "Software Engineer",
      company: "VNG Corporation",
      location: "Ho Chi Minh City",
      summary: "Built the authentication system behind Zalo Web Login, used by millions of people daily.",
    },
    {
      period: "2017 \u2014 2018",
      role: "Web Developer",
      company: "Nguyen Hiep Software",
      location: "Ho Chi Minh City",
      summary: "Full-stack web apps and AWS backends for early-stage commerce products.",
    },
  ] satisfies Role[],
}

export type Project = {
  title: string
  tags: string[]
  image: string
  year: string
  summary: string
  problem: string
  built: string
  result: string
  stack: string
  href: string
  achievement?: string
}

export const works = {
  eyebrow: "Selected work",
  title: "Research turned into software.",
  projects: [
    {
      title: "HiHorus",
      tags: ["Medical AI", "Ophthalmology", "Diagnostics"],
      year: "2024 \u2014 2025",
      image: "/works/hihorus-editorial.jpg",
      summary:
        "AI-powered diagnostic platform for ophthalmology. Detects pathologic myopia and segments lesions on fundus images using deep learning.",
      problem: "Spotting pathologic myopia on eye scans takes a specialist\u2019s time.",
      built: "A deep-learning model that flags it and outlines the lesions on fundus images, inside a web app.",
      result: "Won 2nd Prize at the Global Ortho-K Conference 2025; presented at VOS, November 2025.",
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
      problem: "Reading retinal OCT scans by hand is slow.",
      built: "CNN models that sort scans into disease classes automatically.",
      result: "Optimised for production and served as a REST API.",
      stack: "Python \u00b7 CNN \u00b7 Flask",
      href: "https://github.com/nguyentran4896",
    },
  ] satisfies Project[],
}

export const writing = {
  eyebrow: "Writing",
  title: "Notes and essays.",
  all: "All writing",
}

export const tech = {
  eyebrow: "Tools I use",
  items: ["Ruby on Rails", "TypeScript", "Python", "PyTorch", "PostgreSQL", "AWS", "Kubernetes", "Docker"],
}

export const footer = {
  eyebrow: "Contact",
  heading: "Let\u2019s build something careful.",
  lead: "Open to consulting, research collaborations and senior engineering roles. Email is the quickest route.",
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
    href: "/#work",
    source: "Selected work",
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
    href: "/#about",
    source: "About",
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
      "10+ years engineering, 300,000+ businesses on systems Nguyen works on, 538+ merged pull requests on GitHub and a roughly 70% AI-assisted workflow.",
    href: "/#about",
    source: "About",
  },
  {
    id: "education",
    title: "Education and languages",
    keywords: "education degree university school study hcmut gpa language english vietnamese toeic speak",
    answer:
      "Engineering degree in Computer Science from Ho Chi Minh University of Technology (HCMUT), 2014 to 2018. Nguyen speaks Vietnamese natively and English professionally (TOEIC 820).",
    href: "/#about",
    source: "About",
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
    keywords: "help project can you available availability hire hiring freelance consulting collaborate collaboration open work together engage",
    answer:
      "Nguyen is open to consulting, research collaborations and senior engineering roles: backend and distributed systems, and turning AI research into production software. The quickest route is email, nguyentran4896@gmail.com.",
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
