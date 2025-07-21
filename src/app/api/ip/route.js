// app/api/ip/route.js (Next.js 13/14 API Route uchun)
export async function GET() {
    const https = require('https');
  
    return new Promise((resolve, reject) => {
      https.get('https://api.ipify.org?format=json', (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk });
        resp.on('end', () => {
          const ip = JSON.parse(data).ip;
          resolve(Response.json({ serverIp: ip }));
        });
      }).on('error', (err) => {
        resolve(Response.json({ error: err.message }, { status: 500 }));
      });
    });
  }
  