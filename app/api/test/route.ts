import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Test API route is working' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ 
    message: 'Test POST route is working',
    receivedData: body 
  })
}



