export const site = {
  title: "Nguyen Tran — Senior Engineer & AI Researcher",
  description:
    "Senior Software Engineer with ~10 years in production systems, researching medical AI and computer vision. Bridging AI research with real-world impact.",
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

export type Project = {
  title: string
  tags: string[]
  image: string
  year: string
}

export const works = {
  sectionLabel: "04 — SELECTED WORKS",
  sectionTitle: "Research & Systems",
  projects: [
    {
      title: "HiHorus",
      tags: ["Medical AI", "Ophthalmology", "Diagnostics"],
      image: "/hihorus.jpg",
      year: "2024–2025",
    },
    {
      title: "Retinal OCT Classification",
      tags: ["Deep Learning", "Computer Vision", "Healthcare"],
      image: "/retinal-oct.jpg",
      year: "2024",
    },
  ] satisfies Project[],
}

export const tech = {
  sectionLabel: "05 — TECHNICAL ARSENAL",
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
  socials: [
    { label: "GitHub", href: "https://github.com/nguyentran4896" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nguyentran4896" },
  ],
}

export const nav = {
  brand: "NGUYEN TRAN",
  status: "AVAILABLE FOR WORK",
  links: [
    { label: "About", href: "#about" },
    { label: "Works", href: "#works" },
    { label: "Contact", href: "#contact" },
  ],
}
