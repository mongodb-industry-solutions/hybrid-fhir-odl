import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.toString() ? `?${searchParams}` : '';

    // Forward custom headers from the client to the backend
    const forwardHeaders = {
      'Content-Type': 'application/json',
    };

    // Forward x-debug-filter and x-search-mode headers if present
    const debugFilter = request.headers.get('x-debug-filter');
    const searchMode = request.headers.get('x-search-mode');
    if (debugFilter) forwardHeaders['x-debug-filter'] = debugFilter;
    if (searchMode) forwardHeaders['x-search-mode'] = searchMode;

    const response = await fetch(`${BACKEND_URL}/${path}${query}`, {
      headers: forwardHeaders,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Proxy Error (GET):', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const path = params.path.join('/');
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Proxy Error (POST):', error);
    return NextResponse.json(
      { error: 'Failed to post to backend' },
      { status: 500 }
    );
  }
}
