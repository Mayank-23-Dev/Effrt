import Groq from 'groq-sdk'

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
export const isGroqConfigured = !!groqApiKey

export const groq = isGroqConfigured ? new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true }) : null
