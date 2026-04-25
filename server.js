const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appc6gmUlsII1lnCz';

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/preferences', express.json(), (req, res) => {
  if (!AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN is not set');
    return res.status(500).json({ success: false, error: 'Token not configured' });
  }

  const postData = JSON.stringify({ fields: req.body });

  const options = {
    hostname: 'api.airtable.com',
    port: 443,
    path: '/v0/' + AIRTABLE_BASE + '/Preference%20Submissions',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + AIRTABLE_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const airtableReq = https.request(options, (airtableRes) => {
    let data = '';
    airtableRes.on('data', (chunk) => { data += chunk; });
    airtableRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (airtableRes.statusCode >= 200 && airtableRes.statusCode < 300) {
          console.log('Airtable write success:', parsed.id);
          res.json({ success: true, id: parsed.id });
        } else {
          console.error('Airtable error:', airtableRes.statusCode, data);
          res.status(400).json({ success: false, error: parsed.error || data });
        }
      } catch (e) {
        console.error('Parse error:', e.message, data);
        res.status(500).json({ success: false, error: 'Bad response from Airtable' });
      }
    });
  });

  airtableReq.on('error', (e) => {
    console.error('Request error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  });

  airtableReq.write(postData);
  airtableReq.end();
});

app.listen(PORT, () => {
  console.log('Zora Dashboard running on port ' + PORT);
  console.log('AIRTABLE_TOKEN: ' + (AIRTABLE_TOKEN ? 'set (' + AIRTABLE_TOKEN.substring(0,10) + '...)' : 'NOT SET'));
  console.log('AIRTABLE_BASE: ' + AIRTABLE_BASE);
});
