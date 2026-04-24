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
  ],
}

export type Role = {
  period: string
  role: string
  company: string
  location: string
  summary: string
  stack: string[]
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
      summary:
        "Designing scalable backend systems serving 300,000+ businesses across 5 countries. Leading architectural decisions for distributed payroll services and integrating AI tooling across the engineering organisation.",
      stack: ["Ruby on Rails", "TypeScript", "PostgreSQL", "Kubernetes", "AWS"],
    },
    {
      period: "2018 — 2020",
      role: "Software Engineer",
      company: "VNG Corporation",
      location: "Ho Chi Minh City",
      summary:
        "Architected the full-stack authentication system for Zalo Web Login (millions of daily active users). Built Java microservices, REST APIs, and observability tooling for anomaly detection.",
      stack: ["Java", "Microservices", "REST", "Monitoring"],
    },
    {
      period: "2017 — 2018",
      role: "Web Developer",
      company: "Nguyen Hiep Software",
      location: "Ho Chi Minh City",
      summary:
        "Built full-stack web applications on the MEAN stack. Deployed scalable backend services on AWS for early-stage commerce products.",
      stack: ["MongoDB", "Express", "Angular", "Node.js"],
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
      image: "/hihorus.jpg",
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
      image: "/retinal-oct.jpg",
      summary:
        "Multi-class CNN models for automated retinal disease detection from OCT scans. Optimised for production and deployed as a Flask REST API.",
      stack: "Python · CNN · Flask · Waitress",
      href: "https://github.com/nguyentran4896",
    },
    {
      title: "Employment Hero Platform",
      tags: ["Backend", "Distributed", "Payroll"],
      year: "2021 — Present",
      image: "/futuristic-data-dashboard-dark-minimal.jpg",
      summary:
        "500+ merged PRs across enterprise payroll & HR microservices. Engine optimisation, KeyPay sync services, and infrastructure automation at scale.",
      stack: "Rails · TypeScript · Kubernetes · Redis",
      href: "https://employmenthero.com",
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

export const tech = {
  sectionLabel: "08 — TECHNICAL ARSENAL",
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
    { label: "Email", href: "mailto:nguyentran4896@gmail.com" },
  ],
}

export const nav = {
  brand: "NGUYEN TRAN",
  status: "AVAILABLE FOR WORK",
  links: [
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Works", href: "#works" },
    { label: "Contact", href: "#contact" },
  ],
}
