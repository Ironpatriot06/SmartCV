"""
Prompt templates for resume tailoring.
"""

import json

from schemas.resume import ResumeData

ANTI_HALLUCINATION_RULES = """
You are tailoring a resume for ATS optimization.
Do not invent information.
Return valid JSON only.

STRICT RULES — you MUST follow all of these:
- Do NOT invent companies, job titles, dates, locations, degrees, or projects.
- Do NOT invent technologies, tools, or skills not already present in the input.
- Do NOT invent metrics, percentages, dollar amounts, or achievements.
- Do NOT add new bullet points unless rephrasing existing content (same count or fewer).
- Only improve wording, clarity, ATS keyword alignment, and professionalism.
- Preserve every factual detail; if unsure, keep the original phrasing.
- You MAY expand existing technologies into commonly accepted terminology
  ONLY when that terminology is already implied elsewhere in the resume.
- You MAY use job-description keywords ONLY if they are already present in the resume
  or are standard expansions/synonyms of existing resume terms.
""".strip()

SYSTEM_PREAMBLE = f"""{ANTI_HALLUCINATION_RULES}"""


def full_resume_prompt(resume: ResumeData, job_description: str) -> str:
    """
    Tailor the full resume in a single request.
    Only rewrite summary, experience bullets, project description/bullets, and skills order.
    """
    resume_json = json.dumps(resume.model_dump(), indent=2, ensure_ascii=False)
    return f"""{SYSTEM_PREAMBLE}

TASK: Tailor the resume for ATS alignment with the job description.
- ONLY edit: summary, experience bullets, project description, project bullets, and skills order.
- DO NOT change contact info (name, email, phone, location, links), ids, company, title, dates, locations, education, project names, technologies, url, or github.
- Keep the same number of experience and project entries.
- Keep bullet counts the same unless merging redundant lines improves clarity.
- Reorder bullets within a role/project so the most relevant, ATS-aligned items appear first.
- Reorder skills by relevance to the job description; do NOT add or delete skills.
- Prioritize terminology already present in the resume; only add ATS keywords if they are
  directly supported by existing resume content.
- Promote the most relevant project descriptions by emphasizing role-aligned keywords.
- Analyze the job description for required skills, preferred skills, role type, and domain keywords.
- Analyze the resume for matching skills, matching projects, matching experience, and transferable experience.
- Use the analysis to rewrite the summary so the strongest matches appear first.
- Rewrite bullets using job-description terminology ONLY when the original bullet supports it
  or the same concept appears elsewhere in the resume.
- Example: If the resume already mentions "retrieval-augmented generation" and "vector databases",
  you may rewrite "Built chatbot" to "Developed RAG chatbot using vector databases" — otherwise keep it.
- Do not output the analysis. Only output JSON.

JOB DESCRIPTION:
{job_description}

CURRENT RESUME JSON:
{resume_json}

Return JSON with the same shape as the input (ResumeData).
"""


def summary_prompt(summary: str, job_description: str) -> str:
    """Tailor the professional summary for keyword alignment without adding facts."""
    return f"""{SYSTEM_PREAMBLE}

TASK: Rewrite the professional summary below for the target role.
- Use strong action-oriented language and ATS keywords from the job description ONLY when they truthfully reflect the candidate's background.
- Keep 2–4 sentences. Do not add employers, years of experience, or skills not implied by the original summary.
- You may expand existing technologies into standard terminology only when already supported by the resume.

JOB DESCRIPTION:
{job_description}

CURRENT SUMMARY:
{summary or "(empty)"}

Return JSON: {{ "summary": "<rewritten summary>" }}
"""


def experience_bullets_prompt(
    company: str,
    title: str,
    bullets: list[str],
    job_description: str,
) -> str:
    """Tailor one experience entry's bullets; company/title are context only."""
    bullets_text = "\n".join(f"- {b}" for b in bullets) if bullets else "(no bullets)"
    return f"""{SYSTEM_PREAMBLE}

TASK: Rewrite the achievement bullets for ONE work experience entry.
- Start bullets with strong action verbs where natural.
- Mirror relevant ATS keywords from the job description only when supported by existing content.
- Keep measurable impact only if already stated in the original bullets.
- Do NOT change company name ({company}) or title ({title}) — they are context only.
- Return the same number of bullets as the input, unless merging redundant lines improves clarity.
- Reorder bullets to place the most relevant, ATS-aligned items first.

JOB DESCRIPTION:
{job_description}

ROLE CONTEXT: {title} at {company}

CURRENT BULLETS:
{bullets_text}

Return JSON: {{ "bullets": ["...", "..."] }}
"""


def project_prompt(
    name: str,
    technologies: list[str],
    description: str,
    bullets: list[str],
    job_description: str,
) -> str:
    """Tailor project description and bullets; name/technologies must not change."""
    tech_list = ", ".join(technologies) if technologies else "(none listed)"
    bullets_text = "\n".join(f"- {b}" for b in bullets) if bullets else "(no bullets)"
    return f"""{SYSTEM_PREAMBLE}

TASK: Improve the project description and bullets for ATS alignment.
- Technologies ({tech_list}) and project name ({name}) are fixed — do not add or remove technologies.
- Only rephrase description and bullets; do not invent features or outcomes.
- Use job-description terminology only when it is supported by existing resume content.

JOB DESCRIPTION:
{job_description}

PROJECT: {name}
TECHNOLOGIES (fixed): {tech_list}

CURRENT DESCRIPTION:
{description or "(empty)"}

CURRENT BULLETS:
{bullets_text}

Return JSON: {{ "description": "<rewritten>", "bullets": ["...", "..."] }}
"""


def skills_prompt(skills: list[str], job_description: str) -> str:
    """
    Reorder and lightly rephrase skills for ATS visibility.

    Hallucination prevention: the model may only return skills from the input list
    (validation enforces this after parsing).
    """
    skills_text = ", ".join(skills) if skills else "(none)"
    return f"""{SYSTEM_PREAMBLE}

TASK: Optimize the skills list for the target role.
- Reorder skills to prioritize those most relevant to the job description.
- You may normalize capitalization (e.g. "python" → "Python") but must NOT add new skills.
- Every skill in your output must appear in the input list (same meaning, minor spelling OK).
- Do not remove skills unless the list exceeds 25 items (then drop least relevant only).

JOB DESCRIPTION:
{job_description}

CURRENT SKILLS:
{skills_text}

Return JSON: {{ "skills": ["...", "..."] }}
"""
