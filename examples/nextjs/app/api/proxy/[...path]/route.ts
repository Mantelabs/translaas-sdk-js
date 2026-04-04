/**
 * Next.js API Route Proxy
 *
 * Proxies SDK and API requests to avoid CORS and keep the API key server-side.
 * The client uses `baseUrl` like `origin + '/api/proxy'`, so requests look like:
 * `/api/proxy/sdk/v1/translations/text?...` → forwarded to `${TRANSLAAS_BASE_URL}/sdk/v1/translations/text?...`
 */

import { NextRequest, NextResponse } from 'next/server';

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const apiPath = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const fullPath = `/${apiPath}${queryString ? `?${queryString}` : ''}`;

  const apiBaseUrl = process.env.TRANSLAAS_BASE_URL || 'https://api.translaas.com';
  const apiKey = process.env.TRANSLAAS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'TRANSLAAS_API_KEY not configured' }, { status: 500 });
  }

  const apiUrl = `${apiBaseUrl.replace(/\/+$/, '')}${fullPath}`;
  const accept = request.headers.get('Accept') ?? '*/*';
  const method = request.method.toUpperCase();

  const headers: Record<string, string> = {
    'X-Api-Key': apiKey,
    Accept: accept,
  };

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    body = await request.arrayBuffer();
  }

  const response = await fetch(apiUrl, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || 'API request failed' },
      { status: response.status }
    );
  }

  const contentType = response.headers.get('Content-Type') ?? 'application/octet-stream';
  const data = await response.arrayBuffer();

  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    return await proxyRequest(request, params.path);
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    return await proxyRequest(request, params.path);
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
