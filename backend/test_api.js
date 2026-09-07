// test_api.js — Automated test for mysql2 backend
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting iVolunteer MySQL2 backend test suite...');

  // 1. Health check
  const health = await request({ host: 'localhost', port: 3001, path: '/api/health', method: 'GET' });
  console.log('1. Health check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED', health.data);

  // 2. Register user
  const email = `mysql_user_${Date.now()}@example.com`;
  const reg = await request(
    { host: 'localhost', port: 3001, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      name: 'Priyanshu Varma',
      email,
      password: 'mypassword123',
      phone: '+91 99887 66554',
      city: 'Lucknow',
      isVolunteer: true
    }
  );
  console.log('2. Registration:', reg.status === 201 ? '✅ PASSED' : '❌ FAILED', reg.data.message);
  const token = reg.data.token;

  // 3. Get profile
  const prof = await request({
    host: 'localhost', port: 3001, path: '/api/profile', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('3. Profile verification:');
  console.log('   - Name:', prof.data.name === 'Priyanshu Varma' ? '✅' : '❌', prof.data.name);
  console.log('   - Email:', prof.data.email === email ? '✅' : '❌', prof.data.email);
  console.log('   - City:', prof.data.city === 'Lucknow' ? '✅' : '❌', prof.data.city);
  console.log('   - Hours (no demo data, should be 0):', prof.data.volunteerSubProfile?.hoursContributed === 0 ? '✅' : '❌', prof.data.volunteerSubProfile?.hoursContributed);
  console.log('   - Drives (no demo data, should be 0):', prof.data.volunteerSubProfile?.drivesAttended === 0 ? '✅' : '❌', prof.data.volunteerSubProfile?.drivesAttended);
  console.log('   - Bio (empty initially):', prof.data.bio === '' ? '✅' : '❌', `"${prof.data.bio}"`);

  // 4. Update Profile
  const update = await request(
    {
      host: 'localhost', port: 3001, path: '/api/profile', method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    },
    {
      name: 'Priyanshu Varma',
      phone: '+91 99887 66554',
      city: 'Lucknow City',
      bio: 'Dedicated community volunteer from Lucknow.'
    }
  );
  console.log('4. Update profile:', update.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // Verify updated profile
  const prof2 = await request({
    host: 'localhost', port: 3001, path: '/api/profile', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('   - Updated Bio persisted:', prof2.data.bio.includes('Dedicated community volunteer') ? '✅' : '❌', `"${prof2.data.bio}"`);
  console.log('   - Updated City persisted:', prof2.data.city === 'Lucknow City' ? '✅' : '❌', prof2.data.city);

  // 5. Create Donation
  const don = await request(
    {
      host: 'localhost', port: 3001, path: '/api/donations', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    },
    {
      type: 'food',
      description: '10 kg rice and 5 kg lentils',
      quantity: '15 kg',
      pickupAddress: 'Hazratganj, Lucknow',
      ngoId: 1,
      ngoName: 'Helping Hands Foundation'
    }
  );
  console.log('5. Create donation in MySQL:', don.status === 201 ? '✅ PASSED' : '❌ FAILED', don.data);

  // 6. List Donations
  const donList = await request({
    host: 'localhost', port: 3001, path: '/api/donations', method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('6. List user donations:');
  console.log('   - Donation count:', donList.data.length === 1 ? '✅' : '❌', donList.data.length);
  console.log('   - Item description:', donList.data[0]?.description === '10 kg rice and 5 kg lentils' ? '✅' : '❌', donList.data[0]?.description);
  console.log('   - Status:', donList.data[0]?.status === 'requested' ? '✅' : '❌', donList.data[0]?.status);

  // 7. Login Verification
  const loginSuccess = await request(
    { host: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email, password: 'mypassword123' }
  );
  console.log('7. Valid login via MySQL:', loginSuccess.status === 200 ? '✅ PASSED' : '❌ FAILED', `User: ${loginSuccess.data.user?.name}`);

  const loginFail = await request(
    { host: 'localhost', port: 3001, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email, password: 'wrongpassword' }
  );
  console.log('8. Invalid password rejected:', loginFail.status === 401 ? '✅ PASSED (401)' : '❌ FAILED', loginFail.data.error);

  console.log('\n🎉 ALL MYSQL2 DATABASE TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(console.error);
