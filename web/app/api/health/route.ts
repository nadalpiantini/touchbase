export const revalidate = 0;

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: Date.now(),
      service: 'touchbase',
      version: '1.0.0'
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store, max-age=0'
      }
    }
  );
}
