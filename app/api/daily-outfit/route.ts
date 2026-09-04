import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DailyOutfitResponse } from '@/lib/types';

// Cache this route for 1 hour — weather doesn't need to update every request
export const revalidate = 3600;

interface WeatherData {
  temp: number;
  feels_like: number;
  condition: string;
  icon: string;
  city: string;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY is not configured');

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`OpenWeather API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    condition: data.weather[0].description as string,
    icon: data.weather[0].icon as string,
    city: data.name as string,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get location from query params — default to Colombo, Sri Lanka
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') ?? '6.9271');
    const lon = parseFloat(searchParams.get('lon') ?? '79.8612');

    // Fetch weather and wardrobe in parallel
    const [weather, wardrobeResult] = await Promise.all([
      fetchWeather(lat, lon),
      supabase
        .from('wardrobe_items')
        .select('id, category, color, tags, image_url')
        .eq('user_id', user.id)
        .limit(20),
    ]);

    if (wardrobeResult.error) {
      console.error('Wardrobe fetch error:', wardrobeResult.error);
    }

    const wardrobeItems = wardrobeResult.data ?? [];

    // Build wardrobe description for the prompt
    const wardrobeText =
      wardrobeItems.length > 0
        ? wardrobeItems
            .map(
              (item) =>
                `- ${item.category}${item.color ? ` (${item.color})` : ''}${
                  item.tags && item.tags.length > 0
                    ? `, tags: ${item.tags.join(', ')}`
                    : ''
                } [id: ${item.id}]`
            )
            .join('\n')
        : 'No items in wardrobe yet.';

    // Call Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert personal fashion stylist AI. Based on the current weather and the user's wardrobe, recommend the best outfit for today.

WEATHER:
- Location: ${weather.city}
- Temperature: ${weather.temp}°C (feels like ${weather.feels_like}°C)
- Condition: ${weather.condition}

USER'S WARDROBE:
${wardrobeText}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "outfit": ["item description 1", "item description 2", "item description 3"],
  "rationale": "A single compelling sentence explaining why this outfit works for today's weather and occasion.",
  "tip": "One quick practical styling tip for this outfit."
}

If the wardrobe is empty, suggest a general outfit for the weather. Keep the outfit array to 2-4 items.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse Gemini's JSON response (strip any accidental markdown fences)
    const jsonText = responseText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
    const aiRecommendation = JSON.parse(jsonText) as {
      outfit: string[];
      rationale: string;
      tip: string;
    };

    const response: DailyOutfitResponse = {
      outfit: aiRecommendation.outfit,
      rationale: aiRecommendation.rationale,
      temperature: weather.temp,
      feelsLike: weather.feels_like,
      condition: weather.condition,
      weatherIcon: weather.icon,
      location: weather.city,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Daily outfit error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily outfit recommendation' },
      { status: 500 }
    );
  }
}
