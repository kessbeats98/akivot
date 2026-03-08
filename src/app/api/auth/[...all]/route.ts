// Auth route placeholder.
// TASK-03 replaces this body with: toNextJsHandler(auth) from better-auth/next-js
// Returning 501 now avoids runtime failures before DB schema and auth env vars exist.
export async function GET() {
  return new Response("Auth not yet configured", { status: 501 });
}
export async function POST() {
  return new Response("Auth not yet configured", { status: 501 });
}
