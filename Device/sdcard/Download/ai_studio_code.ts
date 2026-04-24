import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface ChatMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GenerateOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
  systemInstruction?: string
}

async function generateContent(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const {
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    maxOutputTokens = 2048,
    systemInstruction,
  } = options

  const generativeModel = genAI.getGenerativeModel({
    model,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  })

  const result = await generativeModel.generateContent(prompt)
  const response = await result.response
  return response.text()
}

async function generateWithHistory(
  messages: ChatMessage[],
  options: GenerateOptions = {}
): Promise<string> {
  const {
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    maxOutputTokens = 2048,
    systemInstruction,
  } = options

  const generativeModel = genAI.getGenerativeModel({
    model,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  })

  const history = messages.slice(0, -1)
  const lastMessage = messages[messages.length - 1]

  const chat = generativeModel.startChat({ history })
  const result = await chat.sendMessage(lastMessage.parts[0].text)
  const response = await result.response
  return response.text()
}

async function streamContent(
  prompt: string,
  onChunk: (chunk: string) => void,
  options: GenerateOptions = {}
): Promise<void> {
  const {
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    maxOutputTokens = 2048,
    systemInstruction,
  } = options

  const generativeModel = genAI.getGenerativeModel({
    model,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  })

  const result = await generativeModel.generateContentStream(prompt)

  for await (const chunk of result.stream) {
    const chunkText = chunk.text()
    onChunk(chunkText)
  }
}

export { generateContent, generateWithHistory, streamContent }
export type { ChatMessage, GenerateOptions }