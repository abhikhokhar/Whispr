import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const runtime = "edge";

const moodPrompts: Record<string, string> = {
  funny:
    "Generate funny, playful, meme-style anonymous questions with Gen-Z internet vibes.",

  flirty:
    "Generate cute, flirty, charming anonymous questions that feel exciting but respectful.",

  deep:
    "Generate deep and thoughtful anonymous questions that spark meaningful conversations.",

  savage:
    "Generate slightly savage, teasing, witty anonymous questions with fun energy but not offensive.",

  random:
    "Generate weird, random, curiosity-based anonymous questions that feel entertaining.",

  supportive:
    "Generate wholesome, supportive, positive anonymous questions that make people smile.",

  angry:
    "Generate dramatic, sarcastic, emotionally expressive anonymous questions without hate or abuse.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mood = body?.mood || "random";

    const selectedMoodPrompt =
      moodPrompts[mood] || moodPrompts["random"];

    const finalPrompt = `
You are generating message suggestions for an AI-powered anonymous messaging app called Whispr.

${selectedMoodPrompt}

Rules:
- Generate EXACTLY 3 questions
- Output ONLY a single string
- Separate each question using "||"
- Keep each question short, catchy, and social-media friendly
- Make them feel modern and engaging
- Avoid sensitive, hateful, sexual, or illegal topics
- Questions should encourage replies and curiosity
- Add cool internet/chat vibes

Example Output:
What's your most toxic trait honestly?||What's something you'd never post publicly?||Who's your secret favorite person right now?
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 80,
    });

    const questions =
      response.choices[0].message.content ||
      "What's your current obsession?||What's a red flag you ignore every time?||What's something people misunderstand about you?";

    return NextResponse.json({
      success: true,
      mood,
      questions,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}