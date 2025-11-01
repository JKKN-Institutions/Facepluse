import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (will be created per request if env vars not available at build time)
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, key);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { frameData, reactions } = await request.json();

    if (!frameData) {
      return NextResponse.json(
        { error: 'Frame data is required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    // Convert base64 to buffer
    const base64Data = frameData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const fileName = `emoji-reactions/${id}-${timestamp}.png`;
    const { error: uploadError } = await supabase.storage
      .from('public-frames')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload frame' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public-frames')
      .getPublicUrl(fileName);

    // Save metadata to database
    const { error: dbError } = await supabase.from('emoji_reactions').insert({
      id,
      frame_url: urlData.publicUrl,
      reactions: reactions.map((r: { emoji: string; emotion: string; timestamp: number }) => ({
        emoji: r.emoji,
        emotion: r.emotion,
        timestamp: r.timestamp,
      })),
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail if DB insert fails, we still have the image
    }

    // Generate shareable URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/shared/${id}`;

    return NextResponse.json({
      success: true,
      id,
      shareUrl,
      frameUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Share reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Get from database
    const { data, error } = await supabase
      .from('emoji_reactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
