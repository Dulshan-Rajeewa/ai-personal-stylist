import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { OutfitAnalysisResult } from '@/lib/types';

// Do NOT cache analysis requests
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 });
    }

    // Convert file to buffer for Gemini Vision
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload image to Supabase Storage
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('analyses')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get the signed URL (valid for 1 year = 31536000 seconds)
    const { data: signedUrlData } = await supabase.storage
      .from('analyses')
      .createSignedUrl(uploadData.path, 31536000);

    const imageUrl = signedUrlData?.signedUrl ?? uploadData.path;

    // 2. Send to Gemini Vision
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageBase64 = buffer.toString('base64');
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';

    const prompt = `You are an expert fashion stylist AI. Analyze the outfit in this image and provide detailed, constructive feedback.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "score": <number between 1.0 and 10.0, one decimal place>,
  "colorFeedback": "<2-3 sentences about color coordination, palette harmony, and seasonal appropriateness>",
  "fitFeedback": "<2-3 sentences about fit, silhouette, proportions, and tailoring>",
  "accessoryFeedback": "<2-3 sentences about accessories, or suggestions for what to add if missing>",
  "suggestion": "<One actionable, specific improvement that would elevate this outfit to the next level>"
}

Be specific and encouraging. Reference actual elements visible in the image.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text().trim();
    const jsonText = responseText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
    const analysis = JSON.parse(jsonText) as {
      score: number;
      colorFeedback: string;
      fitFeedback: string;
      accessoryFeedback: string;
      suggestion: string;
    };

    // Clamp score to 0–10
    const safeScore = Math.min(10, Math.max(0, Number(analysis.score)));

    // 3. Store in outfit_analyses table
    const { error: dbError } = await supabase
      .from('outfit_analyses')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        style_score: safeScore,
        color_feedback: analysis.colorFeedback,
        fit_feedback: analysis.fitFeedback,
        accessory_feedback: analysis.accessoryFeedback,
        suggestion: analysis.suggestion,
      });

    if (dbError) {
      console.error('DB insert error:', dbError);
      // Don't fail the request — analysis is still valid
    }

    // avg_style_score is auto-updated by the DB trigger

    const response: OutfitAnalysisResult = {
      score: safeScore,
      colorFeedback: analysis.colorFeedback,
      fitFeedback: analysis.fitFeedback,
      accessoryFeedback: analysis.accessoryFeedback,
      suggestion: analysis.suggestion,
      imageUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze outfit error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze outfit' },
      { status: 500 }
    );
  }
}
