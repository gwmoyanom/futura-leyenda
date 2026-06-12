const FOOTBALL_DATA_API = 'https://api.football-data.org/v4'

function corsHeaders(request: Request) {
  const allowedOrigin = Deno.env.get('PUBLIC_SITE_ORIGIN') || '*'
  const origin = request.headers.get('origin') || '*'
  const responseOrigin = allowedOrigin === '*' || allowedOrigin === origin
    ? origin
    : allowedOrigin

  return {
    'Access-Control-Allow-Origin': responseOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  }
}

Deno.serve(async request => {
  const headers = corsHeaders(request)

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (request.method !== 'GET') {
    return Response.json(
      { message: 'Method not allowed' },
      { status: 405, headers }
    )
  }

  const token = Deno.env.get('FOOTBALL_DATA_API_KEY')
  if (!token) {
    return Response.json(
      { message: 'FOOTBALL_DATA_API_KEY is not configured' },
      { status: 500, headers }
    )
  }

  const url = new URL(request.url)
  const competition = url.searchParams.get('competition') || 'WC'
  if (!/^[A-Z0-9_-]{2,20}$/i.test(competition)) {
    return Response.json(
      { message: 'Invalid competition code' },
      { status: 400, headers }
    )
  }

  const upstream = await fetch(`${FOOTBALL_DATA_API}/competitions/${competition}/matches`, {
    headers: { 'X-Auth-Token': token },
  })
  const contentType = upstream.headers.get('content-type') || 'application/json'
  const body = await upstream.text()

  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      ...headers,
      'content-type': contentType,
      'cache-control': 'public, max-age=20',
    },
  })
})
