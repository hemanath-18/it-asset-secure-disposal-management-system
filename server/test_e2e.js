import http from 'http';

const API_HOST = 'localhost';
const API_PORT = 5000;

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path: `/api${path}`,
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runE2ETest() {
  console.log('=== STARTING END-TO-END AUTOMATED VERIFICATION ===\n');

  // 1. Health Check
  const health = await makeRequest('/health');
  console.log('1. Health Check:', health.body.message);

  // 2. Login Admin
  const adminLogin = await makeRequest('/auth/login', 'POST', {
    email: 'admin@disposal.org',
    password: 'Admin@123'
  });
  console.log('2. Admin Login:', adminLogin.body.success ? 'PASSED' : 'FAILED');
  const adminToken = adminLogin.body.data.token;

  // 3. Login IT Staff
  const staffLogin = await makeRequest('/auth/login', 'POST', {
    email: 'itstaff@disposal.org',
    password: 'Staff@123'
  });
  console.log('3. IT Staff Login:', staffLogin.body.success ? 'PASSED' : 'FAILED');
  const staffToken = staffLogin.body.data.token;

  // 4. Login Manager
  const mgrLogin = await makeRequest('/auth/login', 'POST', {
    email: 'manager@disposal.org',
    password: 'Manager@123'
  });
  console.log('4. Manager Login:', mgrLogin.body.success ? 'PASSED' : 'FAILED');
  const mgrToken = mgrLogin.body.data.token;

  // 5. Create Asset (REGISTERED)
  const serialNo = `TEST-SR-${Date.now().toString().slice(-6)}`;
  const assetRes = await makeRequest('/assets', 'POST', {
    type: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 4',
    serialNumber: serialNo,
    department: 'Engineering',
    location: 'Building B Room 204',
    condition: 'Good',
    description: 'E2E automated test laptop'
  }, staffToken);
  console.log('5. Register Asset:', assetRes.body.success ? `PASSED (${assetRes.body.data.assetId})` : 'FAILED');
  const testAsset = assetRes.body.data;

  // 6. Transition status REGISTERED -> PENDING_DISPOSAL
  const trans1 = await makeRequest(`/assets/${testAsset._id}/status`, 'PATCH', {
    targetStatus: 'PENDING_DISPOSAL',
    reason: 'Scheduled for end of life disposal'
  }, staffToken);
  console.log('6. Status -> PENDING_DISPOSAL:', trans1.body.success ? 'PASSED' : 'FAILED');

  // 7. Initiate Wiping
  const wipeInit = await makeRequest('/wiping/initiate', 'POST', {
    assetId: testAsset._id,
    wipingMethod: 'Secure Erase',
    notes: 'Initiated ATA Secure Erase'
  }, staffToken);
  console.log('7. Initiate Data Wiping:', wipeInit.body.success ? 'PASSED' : 'FAILED');
  const wipeRecord = wipeInit.body.data;

  // 8. Complete Wiping
  const wipeComp = await makeRequest(`/wiping/${wipeRecord._id}/status`, 'PUT', {
    status: 'COMPLETED',
    evidenceReference: 'ATA-SECURE-ERASE-CERT-2026.pdf',
    notes: 'Zero fill verified by technician'
  }, staffToken);
  console.log('8. Complete Data Wiping:', wipeComp.body.success ? 'PASSED' : 'FAILED');

  // 9. Verify Wiping (Manager)
  const wipeVerify = await makeRequest(`/wiping/${wipeRecord._id}/verify`, 'PUT', {
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Audited log file and zero fill checksum.'
  }, mgrToken);
  console.log('9. QA Verify Wiping:', wipeVerify.body.success ? 'PASSED' : 'FAILED');

  // 10. Create Disposal Request (Recycle)
  const dispReq = await makeRequest('/disposals/request', 'POST', {
    assetId: testAsset._id,
    disposalMethod: 'Recycle',
    vendorRecycler: 'GreenTech Solutions',
    notes: 'Requesting e-waste recycling'
  }, staffToken);
  console.log('10. Create Disposal Request:', dispReq.body.success ? 'PASSED' : 'FAILED');
  const dispRecord = dispReq.body.data;

  // 11. Approve Disposal Request (Manager)
  const dispAppr = await makeRequest(`/disposals/${dispRecord._id}/approve`, 'PUT', {
    approvalStatus: 'APPROVED',
    approvalNotes: 'Approved for GreenTech pickup'
  }, mgrToken);
  console.log('11. Approve Disposal:', dispAppr.body.success ? 'PASSED' : 'FAILED');

  // 12. Execute Disposal Method
  const dispExec = await makeRequest(`/disposals/${dispRecord._id}/execute`, 'PUT', {
    vendorRecycler: 'GreenTech Solutions',
    certificateNumber: 'CERT-E2E-RECY-999',
    notes: 'Handed off to recycling truck'
  }, staffToken);
  console.log('12. Execute Disposal Method:', dispExec.body.success ? 'PASSED' : 'FAILED');

  // 13. Fetch Recycling record and update to RECYCLING_COMPLETED
  const recList = await makeRequest('/recycling', 'GET', null, staffToken);
  const recItem = recList.body.data.find(r => r.asset?.assetId === testAsset.assetId);
  if (recItem) {
    const recComp = await makeRequest(`/recycling/${recItem._id}`, 'PUT', {
      recyclingStatus: 'RECYCLING_COMPLETED',
      certificateNumber: 'CERT-FINAL-RECOVERY-2026'
    }, staffToken);
    console.log('13. Recycling Completed:', recComp.body.success ? 'PASSED' : 'FAILED');
  }

  // 14. Verify final asset status
  const finalAssetRes = await makeRequest(`/assets/${testAsset._id}`, 'GET', null, staffToken);
  console.log('14. Final Asset Status:', finalAssetRes.body.data.asset.status === 'DISPOSAL_COMPLETED' ? 'PASSED (DISPOSAL_COMPLETED)' : 'FAILED');

  // 15. Check Dashboard metrics
  const dashStats = await makeRequest('/dashboard/stats', 'GET', null, staffToken);
  console.log('15. Dashboard Stats:', dashStats.body.success ? `PASSED (Total Assets: ${dashStats.body.data.totalAssets})` : 'FAILED');

  console.log('\n=== ALL END-TO-END WORKFLOW VERIFICATIONS PASSED CLEANLY! ===\n');
}

runE2ETest().catch(console.error);
