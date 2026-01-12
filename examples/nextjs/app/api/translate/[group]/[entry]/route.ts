/**
 * Next.js API Route - Translation Endpoint
 *
 * Demonstrates using Translaas SDK in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerService } from '../../../../lib/translaas';

export async function GET(
  request: NextRequest,
  { params }: { params: { group: string; entry: string } }
) {
  try {
    const { group, entry } = params;
    const lang = request.nextUrl.searchParams.get('lang') || 'en';

    // Create service with request for language resolution
    const translaas = createServerService({
      params: {},
      query: { lang },
      headers: Object.fromEntries(request.headers.entries()),
      cookies: {},
    });

    const translation = await translaas.t(group, entry, lang);

    return NextResponse.json({
      group,
      entry,
      language: lang,
      translation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
