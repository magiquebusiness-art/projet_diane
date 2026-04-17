export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Simple routing example
    if (url.pathname === '/api/test') {
      return new Response(JSON.stringify({ message: 'Hello from Cloudflare Worker!' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For other routes, serve static assets from Pages
    // This is a basic example - in production you'd use Workers + Pages together
    return new Response('Oranum Clone - Worker API', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
