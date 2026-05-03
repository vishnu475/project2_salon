
import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/health');
    console.log('Health check:', await res.json());
  } catch (err) {
    console.error('Server not reachable:', err.message);
  }
}

test();
