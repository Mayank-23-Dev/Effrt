import { groq, isGroqConfigured } from '../lib/groq'

export interface StandupSummaryInput {
  memberName: string
  content: string
}

export const aiService = {
  async generateStandupDigest(
    workspaceName: string,
    standups: StandupSummaryInput[],
    missingMembers: string[]
  ): Promise<string> {
    if (isGroqConfigured && groq) {
      try {
        const standupText = standups
          .map((s) => `- ${s.memberName}: "${s.content}"`)
          .join('\n')
        
        const missingText = missingMembers.length > 0 
          ? `Missing standups from: ${missingMembers.join(', ')}`
          : 'All active members submitted updates!'

        const prompt = `You are the EFFRT project manager AI. Generate a concise, professional executive standup summary digest for the team workspace "${workspaceName}".

Here are the updates submitted by members today:
${standupText}

${missingText}

Your digest must include:
1. A 2-sentence executive summary of progress.
2. Bullet points of key achievements and current blockers.
3. A friendly warning identifying any missing members who need to submit their updates.

Keep it professional, action-oriented, and under 150 words. Format with standard Markdown.`

        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-specdec',
          temperature: 0.5,
          max_tokens: 400
        })

        return chatCompletion.choices[0]?.message?.content || 'Failed to generate digest.'
      } catch (e) {
        console.error('Groq API Error, falling back to simulated digest:', e)
        return this.getSimulatedDigest(workspaceName, standups, missingMembers)
      }
    } else {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return this.getSimulatedDigest(workspaceName, standups, missingMembers)
    }
  },

  getSimulatedDigest(
    workspaceName: string,
    standups: StandupSummaryInput[],
    missingMembers: string[]
  ): string {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let digest = `### ⚡ EFFRT Standup Digest: *${workspaceName}*\n`
    digest += `**Date:** ${today}\n\n`

    if (standups.length === 0) {
      digest += `⚠️ **No updates submitted today.** The team has been silent.\n`
      if (missingMembers.length > 0) {
        digest += `🚨 **Inactive Members:** ${missingMembers.map((m) => `**${m}**`).join(', ')} need to submit their updates immediately.`
      }
      return digest
    }

    // Generate executive summary paragraph
    digest += `#### 📋 Executive Summary\n`
    const completedTasksCount = standups.filter(s => s.content.toLowerCase().includes('complete') || s.content.toLowerCase().includes('finish') || s.content.toLowerCase().includes('done')).length
    
    digest += `The team is showing steady progress. With **${standups.length}** updates submitted, tasks are moving forward smoothly. `
    if (completedTasksCount > 0) {
      digest += `Key milestones were reached in database configurations and UI setups. `
    }
    digest += `Focus is shifting towards integrating core application interfaces and styling systems.\n\n`

    // Generate member updates bullet points
    digest += `#### 🔍 Today's Accomplishments\n`
    standups.forEach((s) => {
      // Parse content to make it look like a nice summarization
      let summary = s.content
      if (summary.endsWith('.')) summary = summary.slice(0, -1)
      digest += `- **${s.memberName}**: ${summary}.\n`
    })
    digest += `\n`

    // Add warning for missing members (Ghost Alert!)
    if (missingMembers.length > 0) {
      digest += `#### 🚨 Ghost Alerts (Missing Updates)\n`
      digest += `The following member(s) have not submitted today's standup and risk triggering a Ghost Alert Badge:\n`
      missingMembers.forEach((m) => {
        digest += `- **${m}** — *No activity recorded today.*\n`
      })
    } else {
      digest += `#### 🎉 Contribution Status\n`
      digest += `100% participation! All members are active and accounted for today.`
    }

    return digest
  }
}
