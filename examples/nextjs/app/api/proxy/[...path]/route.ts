/**
 * Next.js API Route Proxy
 *
 * Proxies API requests to avoid CORS issues in client-side components
 * This route forwards requests to the actual Translaas API server
 *
 * The TranslaasClient constructs URLs like: ${baseUrl}/api/translations/text?...
 * So when baseUrl is set to /api/proxy, the request becomes /api/proxy/api/translations/text
 * This proxy strips /api/proxy and forwards /api/translations/text to the actual API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const { path } = params;
    // Reconstruct the full API path (e.g., "api/translations/text")
    const apiPath = path.join('/');

    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullPath = `/${apiPath}${queryString ? `?${queryString}` : ''}`;

    // Get API configuration from environment (server-side only)
    const apiBaseUrl = process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com';
    const apiKey = process.env.TRANSLAAS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'TRANSLAAS_API_KEY not configured' }, { status: 500 });
    }

    // Build the full API URL
    const apiUrl = `${apiBaseUrl}${fullPath}`;

    // Forward the request to the actual API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'text/plain',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'API request failed' },
        { status: response.status }
      );
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*', // Allow CORS for client-side requests
      },
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: error.message || 'Proxy request failed' }, { status: 500 });
  }
}
