/**
 * NyXia Flipbook - Cloudflare Worker Backend
 * Gère les publications en sous-domaine et l'API
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
    
    // API Routes
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env, ctx)
    }
    
    // Embed route for iframe integration
    if (pathname.startsWith('/embed/')) {
      const flipbookId = pathname.split('/')[2]
      return handleEmbed(flipbookId, env)
    }
    
    // Subdomain routing for publications
    const host = url.hostname
    const subdomain = host.split('.')[0]
    
    if (subdomain !== 'www' && subdomain !== 'nyxia-flipbook') {
      // Check if subdomain corresponds to a publication
      const publication = await getPublicationBySubdomain(subdomain, env)
      if (publication) {
        return serveFlipbook(publication, env)
      }
    }
    
    // Default: serve static assets from Pages
    return env.ASSETS.fetch(request)
  }
}

async function handleAPI(request, env, ctx) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  try {
    // Create publication
    if (pathname === '/api/publications' && request.method === 'POST') {
      const data = await request.json()
      const publication = await createPublication(data, env)
      return jsonResponse(publication, corsHeaders)
    }
    
    // Get publication by ID
    if (pathname.match(/^\/api\/publications\/[a-zA-Z0-9]+$/) && request.method === 'GET') {
      const id = pathname.split('/')[3]
      const publication = await getPublicationById(id, env)
      
      if (publication) {
        return jsonResponse(publication, corsHeaders)
      } else {
        return jsonResponse({ error: 'Publication not found' }, corsHeaders, 404)
      }
    }
    
    // Update publication settings
    if (pathname.match(/^\/api\/publications\/[a-zA-Z0-9]+\/settings$/) && request.method === 'PUT') {
      const id = pathname.split('/')[3]
      const settings = await request.json()
      const publication = await updatePublicationSettings(id, settings, env)
      return jsonResponse(publication, corsHeaders)
    }
    
    // Delete publication
    if (pathname.match(/^\/api\/publications\/[a-zA-Z0-9]+$/) && request.method === 'DELETE') {
      const id = pathname.split('/')[3]
      await deletePublication(id, env)
      return jsonResponse({ success: true }, corsHeaders)
    }
    
    // List all publications
    if (pathname === '/api/publications' && request.method === 'GET') {
      const publications = await listPublications(env)
      return jsonResponse(publications, corsHeaders)
    }
    
    return jsonResponse({ error: 'Not found' }, corsHeaders, 404)
  } catch (error) {
    console.error('API Error:', error)
    return jsonResponse({ error: 'Internal server error' }, corsHeaders, 500)
  }
}

async function handleEmbed(flipbookId, env) {
  // Serve minimal embed page
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NyXia Flipbook</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #0A1628; }
    #flipbook-container { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="flipbook-container"></div>
  <script>
    // Load flipbook with ID: ${flipbookId}
    window.flipbookId = '${flipbookId}';
    // Initialize flipbook viewer here
  </script>
</body>
</html>
  `
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

async function serveFlipbook(publication, env) {
  // Check password protection
  if (publication.passwordProtected) {
    // Would need to check session/auth here
  }
  
  // Serve the flipbook viewer with the publication data
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${publication.title || 'NyXia Flipbook'}</title>
</head>
<body>
  <div id="flipbook-viewer" data-id="${publication.id}"></div>
  <script>
    window.publicationData = ${JSON.stringify(publication)};
  </script>
</body>
</html>
  `
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  })
}

// KV Store helpers (would use env.FLIPBOOKS in production)
async function createPublication(data, env) {
  const id = 'fb_' + Math.random().toString(36).substr(2, 9)
  const publication = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    subdomain: id.replace('fb_', ''),
    views: 0
  }
  
  // In production: await env.FLIPBOOKS.put(id, JSON.stringify(publication))
  console.log('Creating publication:', publication)
  
  return publication
}

async function getPublicationById(id, env) {
  // In production: return JSON.parse(await env.FLIPBOOKS.get(id))
  return null
}

async function getPublicationBySubdomain(subdomain, env) {
  // In production: query KV or D1 database
  return null
}

async function updatePublicationSettings(id, settings, env) {
  // In production: update in KV
  return { id, ...settings }
}

async function deletePublication(id, env) {
  // In production: await env.FLIPBOOKS.delete(id)
}

async function listPublications(env) {
  // In production: list from KV
  return []
}

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
}
