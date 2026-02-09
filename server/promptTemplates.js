const generateStudentAnalysisPrompt = (profile) => `
You are an expert academic advisor and career counselor.
**Goal:** Ask ONE high-impact question to clarify the student's academic path or preferences.

**Student Profile:**
${JSON.stringify(profile, null, 2)}

**Constraints:**
- Ask only ONE question.
- Keep it short (max 1-2 lines).
- Focus on career clarity, specific skills, or learning style.
- Avoid repetitive cost questions if budget is already set.
- **STRICT JSON OUTPUT ONLY**.

**Output JSON:**
{
  "question": "The question string",
  "reason": "Brief reason why this helps"
}
`;

const generateRecommendationPrompt = (profile) => `
You are a senior academic decision engine. 
**Goal:** Generate 3 top university/major recommendations based on the profile.

**Profile:**
${JSON.stringify(profile, null, 2)}

**Formatting Rules:**
- Use **bullet points** only (no paragraphs).
- **Bold** key insights.
- Keep answers concise and actionable.
- **STRICT JSON OUTPUT ONLY**.

**Output JSON Structure:**
{
  "summary": "Brief executive summary (bullet points preferred).",
  "recommendations": [
    {
      "country": "Country",
      "university": "University Name",
      "major": "Major",
      "ranking": "Global Ranking (e.g. #45)",
      "tuition_fees": "Approx Tuition (e.g. $20k/year)",
      "why_this_choice": "Short bullet points with **bold** highlights.",
      "risk_flags": ["Risk 1", "Risk 2"],
      "admission_probability": "High/Medium/Low"
    }
  ],
  "top_scholarships": [
      {
          "name": "Scholarship Name",
          "amount": "Amount",
          "deadline": "Deadline",
          "eligibility": "Criteria (brief)"
      }
  ],
  "risks": ["General risk 1"],
  "alternatives": ["Alternative path 1"]
}
`;

const generateRoadmapPrompt = (profile, recommendations) => `
**Goal:** Create a detailed 12-18 month academic roadmap.
**Target:** ${JSON.stringify(recommendations[0] || "General Path")}

**Rules:**
- Divide into structured phases (e.g., Immediate, Short-term, Long-term).
- **Highlight costs in GREEN** (e.g. "**$150 USD**").
- Use bullet points for actions.
- **STRICT JSON OUTPUT ONLY**.

**Output JSON Structure:**
{
  "roadmap": [
    {
      "phase": "Phase Name (e.g. Month 1-3: Foundation)",
      "description": "Short description of this phase.",
      "actions": ["Action 1 (bold important parts)", "Action 2"],
      "exams": ["IELTS", "SAT"],
      "skills_to_learn": ["Skill 1", "Skill 2"],
      "cost_estimate": "Estimated cost (e.g. **$500 USD**)",
      "timeline": "Month X-Y"
    }
  ]
}
`;

module.exports = {
  generateStudentAnalysisPrompt,
  generateRecommendationPrompt,
  generateRoadmapPrompt
};
