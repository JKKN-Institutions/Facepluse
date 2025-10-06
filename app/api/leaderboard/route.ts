import { NextResponse } from 'next/server'

// In-memory store (replace with database in production)
let leaderboard: Array<{
  id: string
  score: number
  timestamp: string
}> = []

export async function GET() {
  try {
    const top10 = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    return NextResponse.json(top10)
  } catch (error) {
    console.error('Leaderboard GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { score } = await request.json()

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const entry = {
      id: crypto.randomUUID(),
      score,
      timestamp: new Date().toISOString(),
    }

    leaderboard.push(entry)

    // Keep only top 100
    if (leaderboard.length > 100) {
      leaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Leaderboard POST error:', error)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    leaderboard = []
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Leaderboard DELETE error:', error)
    return NextResponse.json({ error: 'Failed to clear leaderboard' }, { status: 500 })
  }
}
