import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache quotes to avoid repeated API calls
const quoteCache = new Map<string, { quote: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    const { emotion } = await request.json();

    if (!emotion) {
      return NextResponse.json({ error: 'Emotion is required' }, { status: 400 });
    }

    // Check cache
    const cached = quoteCache.get(emotion);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ quote: cached.quote });
    }

    // Generate quote using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly motivational coach. Generate very short, simple, uplifting quotes using everyday English. Use basic words that everyone understands. Keep it positive and encouraging.',
        },
        {
          role: 'user',
          content: `Create a short motivational quote for someone feeling "${emotion}". Use simple everyday English words. Maximum 10 words. Make it positive and uplifting.`,
        },
      ],
      max_tokens: 30,
      temperature: 0.7,
    });

    const quote = response.choices[0].message.content?.trim() || 'Keep smiling! You are amazing!';

    // Cache the quote
    quoteCache.set(emotion, { quote, timestamp: Date.now() });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Quote generation error:', error);

    // Fallback quotes if OpenAI fails
    const fallbackQuotes: Record<string, string> = {
      happy: 'Keep that beautiful smile shining bright! ✨',
      sad: 'Every moment is a new beginning. You got this! 💪',
      neutral: 'You are doing great! Keep going! 🌟',
      surprised: 'Life is full of amazing moments! 🎉',
      angry: 'Take a deep breath. Peace starts with a smile. 🌸',
    };

    return NextResponse.json({
      quote: fallbackQuotes[emotion as keyof typeof fallbackQuotes] || 'You are amazing! Keep shining! ⭐'
    });
  }
}
