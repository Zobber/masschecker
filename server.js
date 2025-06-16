const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/v2/check', async (req, res) => {
  try {
    const { ipAddress, maxAgeInDays } = req.query;
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: { ipAddress, maxAgeInDays },
      headers: {
        'Key': process.env.VITE_ABUSEIPDB_API_KEY,
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 