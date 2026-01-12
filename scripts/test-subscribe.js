#!/usr/bin/env node

/**
 * Test script for the subscribe API
 * Usage: node scripts/test-subscribe.js
 */

const fetch = require('node-fetch');

async function testSubscribeAPI() {
  console.log('🧪 Test de l\'API /api/subscribe');

  try {
    const response = await fetch('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 1,
        amount: 100
      }),
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('Response:', text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Success:', data);
    } else {
      console.log('❌ Error response:', text);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testSubscribeAPI();
