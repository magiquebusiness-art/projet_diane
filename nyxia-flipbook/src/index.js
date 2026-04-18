/**
 * NyXia Flipbook — Cloudflare Workers
 * Servir le flipbook statique
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Mapping des routes vers les fichiers
    let filePath = pathname === '/' ? '/index.html' : pathname
    
    // Déterminer le type de contenu
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    }

    const ext = filePath.substring(filePath.lastIndexOf('.'))
    const contentType = contentTypes[ext] || 'text/plain'

    try {
      // Pour un déploiement réel, vous utiliseriez R2 ou un bucket
      // Ici on retourne un HTML inline pour la démo
      if (filePath === '/index.html' || filePath === '/') {
        const html = await Assets.fetch(new Request('https://example.com/index.html'))
        return new Response(html.body, {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'public, max-age=3600'
          }
        })
      }

      // Fallback pour les assets
      return new Response('NyXia Flipbook — Asset: ' + filePath, {
        headers: {
          'content-type': contentType,
          'cache-control': 'public, max-age=86400'
        }
      })

    } catch (e) {
      // Retourner l'HTML principal pour le routing SPA
      return new Response(getHTML(), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'public, max-age=3600'
        }
      })
    }
  }
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NyXia Flipbook</title>
</head>
<body>
  <h1>NyXia Flipbook — En cours de déploiement</h1>
</body>
</html>`
}
