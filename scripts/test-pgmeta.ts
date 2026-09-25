const base = 'http://jg-store-bd.press-cloud.com';
const sKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

async function testHeaders() {
  const headersList = [
    { 'x-api-key': sKey },
    { 'apikey': sKey },
    { 'Authorization': `Bearer ${sKey}` },
    { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` },
    { 'x-connection-encrypted': 'true', 'apikey': sKey, 'Authorization': `Bearer ${sKey}` },
    {}
  ];

  for (let i = 0; i < headersList.length; i++) {
    const h = {
      'Content-Type': 'application/json',
      ...headersList[i]
    };
    const res = await fetch(base + '/api/pg-meta/default/query', {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ query: 'SELECT 1;' })
    });
    console.log(`Config ${i}:`, res.status, await res.text());
  }
}

testHeaders();
