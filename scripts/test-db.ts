import net from 'net';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://jg-store-bd.press-cloud.com';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.MHnaK-G4RLBfaybcOR7IOVsRj6WK5of1v3xooRJAObc';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

async function testServices() {
  console.log('--- Testing Supabase Services on Dokploy ---');

  // 1. Auth Health
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: ANON_KEY }
    });
    console.log('/auth/v1/health:', res.status, await res.text());
  } catch (e: any) {
    console.log('/auth/v1/health error:', e.message);
  }

  // 2. Storage
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });
    console.log('/storage/v1/bucket:', res.status, await res.text());
  } catch (e: any) {
    console.log('/storage/v1/bucket error:', e.message);
  }

  // 3. Test Service Role Key with PostgREST
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });
    console.log('/rest/v1/ with SERVICE_KEY:', res.status, await res.text().then(t => t.slice(0, 200)));
  } catch (e: any) {
    console.log('/rest/v1/ error:', e.message);
  }

  // 4. Test TCP Port 5432 (PostgreSQL direct)
  console.log('Testing TCP Port 5432 on jg-store-bd.press-cloud.com...');
  const socket = new net.Socket();
  socket.setTimeout(4000);

  socket.connect(5432, 'jg-store-bd.press-cloud.com', () => {
    console.log('PORT 5432 (PostgreSQL) is OPEN and reachable!');
    socket.destroy();
  });

  socket.on('error', (err) => {
    console.log('PORT 5432 closed or unreachable:', err.message);
  });

  socket.on('timeout', () => {
    console.log('PORT 5432 timed out');
    socket.destroy();
  });
}

testServices();
