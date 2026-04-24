const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appc6gmUlsII1lnCz';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/preferences', express.json(), async (req, res) => {
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
      res.status(400).json({ success: false, error: data.error });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Zora's Dashboard running on port ${PORT}`);
});
