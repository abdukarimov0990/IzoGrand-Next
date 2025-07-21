const https = require('https');

https.get('https://api.ipify.org?format=json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    const ip = JSON.parse(data).ip;
    console.log('🔍 Server IP manzili:', ip);
  });

}).on('error', (err) => {
  console.log('❌ Xatolik:', err.message);
});
