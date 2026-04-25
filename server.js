const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appc6gmUlsII1lnCz';

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint: save preferences to Airtable
app.post('/api/preferences', express.json(), async (req, res) => {
  if (!AIRTABLE_TOKEN) {
    return res.status(500).json({ success: false, error: 'AIRTABLE_TOKEN not set' });
  }
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Preference%20Submissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: req.body })
      }
    );
    const data = await response.json();
    if (response.ok) {
      res.json({ success: true, id: data.id });
    } else {
      console.error('Airtable error:', data);
      res.status(400).json({ success: false, error: data.error });
    }
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Zora Dashboard running on port ${PORT}`);
  console.log(`AIRTABLE_TOKEN: ${AIRTABLE_TOKEN ? 'set' : 'NOT SET'}`);
  console.log(`AIRTABLE_BASE: ${AIRTABLE_BASE}`);
});
