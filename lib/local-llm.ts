/**
 * lib/local-llm.ts
 * Thin wrapper around @mlc-ai/web-llm for the on-device chat panel.
 * Builds the system prompt from live lib/content.ts facts so bio can never drift.
 */

import { hero, about, experience, works, recognition, footer } from "@/lib/content"

export const MODEL_ID = "SmolLM2-360M-Instruct-q4f16_1-MLC"

/**
 * Build the system prompt by pulling facts directly from lib/content.ts.
 * This ensures the chatbot's knowledge stays in sync with the page content.
 */
export function buildSystemPrompt(): string {
  const roles = experience.roles
    .map(
      (r) =>
        `- ${r.period} · ${r.role} · ${r.company} (${r.location})\n  ${r.summary}\n  Stack: ${r.stack.join(", ")}`,
    )
    .join("\n")

  const projects = works.projects
    .map(
      (p) =>
        `- ${p.title} (${p.year}): ${p.summary}${p.achievement ? " [" + p.achievement + "]" : ""}`,
    )
    .join("\n")

  const aboutStatements = about.statements.join(" ")

  return `You are a concise assistant representing ${hero.topTitleLine1} ${hero.topTitleLine2} — Nguyen Tran.

Facts about Nguyen Tran:
Name: Nguyen Tran
Role: Senior Software Engineer & AI Researcher
Location: Ho Chi Minh City, Vietnam
Contact: ${footer.email}
GitHub: ${footer.socials.find((s) => s.label === "GitHub")?.href ?? "https://github.com/nguyentran4896"}
LinkedIn: ${footer.socials.find((s) => s.label === "LinkedIn")?.href ?? ""}
ORCID: ${footer.socials.find((s) => s.label === "ORCID")?.href ?? ""}

Bio: ${aboutStatements}

Experience:
${roles}

Education: ${experience.education.degree} · ${experience.education.school} (${experience.education.period}) — ${experience.education.note}

Projects:
${projects}

Recognition: ${recognition.award.place} — ${recognition.award.event} (${recognition.award.date})
Paper: "${recognition.award.paper}"
${recognition.award.follow}

Research interests: ${recognition.interests.join(", ")}

Languages: ${recognition.languages.map((l) => `${l.name} (${l.level})`).join(", ")}

Instructions:
- Answer questions about Nguyen Tran concisely and factually using only the above information.
- If asked something outside this profile, say you don't have that information.
- You are a small on-device model (SmolLM2-360M). When uncertain, admit it plainly.
- Keep answers brief — 2-4 sentences unless more detail is clearly needed.
- Do not hallucinate facts. Stick strictly to what is listed above.
- Respond in plain text only, no markdown formatting.`
}
