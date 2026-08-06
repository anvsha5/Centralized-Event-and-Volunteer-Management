const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

function noHistory() {
  return 'No task history yet';
}

function hasNoHistory(stats) {
  return stats.reliabilityScore === null || stats.reliabilityScore === undefined;
}

async function callAnthropic(systemPrompt, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 180,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${detail}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;
  return typeof text === 'string' ? text.trim() : null;
}

function fallbackVolunteerSummary(stats) {
  const reliabilityPct = Math.round((stats.reliabilityScore || 0) * 100);
  return `Reliability is ${reliabilityPct}% based on ${stats.completedCount} completed tasks and ${stats.noShowCount} no-shows. Volunteer skills include ${stats.skills.join(', ') || 'none listed'}.`;
}

function fallbackSkillMatchSummary(stats) {
  const tasks = stats.recentTaskTitles && stats.recentTaskTitles.length > 0
    ? stats.recentTaskTitles.join(', ')
    : 'no recent completed tasks';
  return `Recent completed work includes ${tasks}. This should be reviewed against stated skills: ${stats.skills.join(', ') || 'none listed'}.`;
}

async function summarizeVolunteer(stats) {
  if (hasNoHistory(stats)) {
    return noHistory();
  }

  const systemPrompt = 'You write concise, factual volunteer reliability summaries for event operations dashboards. Do not invent facts. Keep to 1-2 sentences.';
  const userPrompt = `Create a grounded reliability summary from this JSON:\n${JSON.stringify({
    skills: stats.skills || [],
    reliabilityScore: stats.reliabilityScore,
    completedCount: stats.completedCount || 0,
    noShowCount: stats.noShowCount || 0,
    recentTaskTitles: stats.recentTaskTitles || [],
  })}`;

  try {
    const text = await callAnthropic(systemPrompt, userPrompt);
    return text || fallbackVolunteerSummary(stats);
  } catch (error) {
    console.error('summarizeVolunteer AI error:', error.message);
    return fallbackVolunteerSummary(stats);
  }
}

async function summarizeSkillMatch(stats) {
  if (hasNoHistory(stats)) {
    return noHistory();
  }

  const systemPrompt = 'You write concise, factual skill-match summaries for volunteers. Compare completed tasks to stated skills only. Keep to 1-2 sentences. Do not invent facts.';
  const userPrompt = `Create a grounded skill-match summary from this JSON:\n${JSON.stringify({
    skills: stats.skills || [],
    reliabilityScore: stats.reliabilityScore,
    completedCount: stats.completedCount || 0,
    noShowCount: stats.noShowCount || 0,
    recentTaskTitles: stats.recentTaskTitles || [],
  })}`;

  try {
    const text = await callAnthropic(systemPrompt, userPrompt);
    return text || fallbackSkillMatchSummary(stats);
  } catch (error) {
    console.error('summarizeSkillMatch AI error:', error.message);
    return fallbackSkillMatchSummary(stats);
  }
}

module.exports = {
  summarizeVolunteer,
  summarizeSkillMatch,
};
