import { NextResponse } from 'next/server'

// This API endpoint is no longer needed!
// We now use face-api.js which runs entirely in the browser (client-side)
// See: hooks/useFaceAnalysis.ts for the face-api.js implementation

export async function POST() {
  return NextResponse.json(
    {
      message: 'This API endpoint is deprecated. Face analysis now runs client-side using face-api.js',
      info: 'Check hooks/useFaceAnalysis.ts for the implementation'
    },
    { status: 200 }
  )
}
