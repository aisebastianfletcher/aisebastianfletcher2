const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task, model } = req.body;
  if (!task || !model) {
    return res.status(400).json({ error: 'Task and model are required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const selectedModel = genAI.getGenerativeModel({ model });
    const promptRequest = `Generate an optimized prompt template for the task: "${task}". The prompt should be clear, concise, and tailored for ${model}. Include placeholders for user input where applicable.`;
    const result = await selectedModel.generateContent(promptRequest);
    const prompt = result.response.text();

    res.status(200).json({ prompt });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
}
