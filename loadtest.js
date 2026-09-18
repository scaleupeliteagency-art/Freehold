import http from 'k6/http';
import { check, sleep } from 'k6';

// This configuration simulates 500 real-time users
export const options = {
  stages: [
    { duration: '10s', target: 500 }, // Ramp-up from 0 to 500 users
    { duration: '15s', target: 500 },  // Maintain 500 concurrent users
    { duration: '5s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

export default function () {
  // IMPORTANT: Do not run 500 concurrent users against a local "npm run dev" server!
  const BASE_URL = 'https://workingledger.vercel.app'; // Change this to your Vercel URL to test production!
  
  // 1. User visits the Homepage
  const resHome = http.get(`${BASE_URL}/`);
  check(resHome, {
    'homepage status is 200': (r) => r.status === 200,
  });
  
  // Simulate user reading the homepage for 1 to 3 seconds
  sleep(Math.random() * 2 + 1);
  
  // 2. User navigates to the Login page
  const resLogin = http.get(`${BASE_URL}/login`);
  check(resLogin, {
    'login page status is 200': (r) => r.status === 200,
  });

  // Simulate user filling out the form
  sleep(Math.random() * 2 + 1);
}
