import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, template } = body;

    console.log('Received new prompt template:', { name, description, template });

    // In a real application, you would save this to your database.
    // For now, we'll just return a success message.

    return NextResponse.json({ message: 'Prompt template created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt template:', error);
    return NextResponse.json({ error: 'Failed to create prompt template.' }, { status: 500 });
  }
}

