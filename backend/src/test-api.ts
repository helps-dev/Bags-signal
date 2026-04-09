import axios from 'axios';
import { config } from './utils/config';

async function testApi() {
  console.log('--- Testing Bags Signal API ---');
  console.log(`URL: http://localhost:${config.PORT}`);
  
  try {
    const health = await axios.get(`http://localhost:${config.PORT}/health`);
    console.log('✅ Health check:', health.data.status);

    const feed = await axios.get(`http://localhost:${config.PORT}/api/signals/feed`);
    console.log('✅ Signal Feed:', Array.isArray(feed.data) ? `${feed.data.length} tokens` : 'invalid response');
    
    if (feed.data.length > 0) {
      const mint = feed.data[0].tokenMint;
      const score = await axios.get(`http://localhost:${config.PORT}/api/signals/score/${mint}`);
      console.log('✅ Token Score:', score.data.score);
    }
    
    console.log('--- API Test Passed ---');
  } catch (error) {
    console.error('❌ API Test Failed:', error instanceof Error ? error.message : error);
  }
}

testApi();
