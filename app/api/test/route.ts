import { NextRequest, NextResponse } from 'next/server';

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // You can get query parameters like this:
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || 'Guest';

    return NextResponse.json(
      {
        success: true,
        message: `Hello ${name}! This is a GET request`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing GET request',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST request handler
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body from request
    const body = await request.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    // Process the data (in real app, you'd save to database)
    return NextResponse.json(
      {
        success: true,
        message: 'Data received successfully!',
        data: {
          name,
          email,
          message: message || 'No message provided',
          receivedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing POST request',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

