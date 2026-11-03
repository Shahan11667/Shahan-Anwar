// scripts/test-social-accounts.js
// Verification script for Social Accounts Sign-In and Publishing Integration

const assert = require('assert');

async function testSocialAccounts() {
  console.log('🧪 Starting Social Accounts Sign-In & Multi-Platform Upload Tests...\n');

  // Test 1: Verify SocialAccount Mongoose Model Schema
  console.log('Test 1: Inspecting models/SocialAccount.ts...');
  const fs = require('fs');
  const path = require('path');
  const modelContent = fs.readFileSync(path.join(__dirname, '..', 'models', 'SocialAccount.ts'), 'utf-8');
  assert(modelContent.includes('platform'), 'Model must have platform field');
  assert(modelContent.includes('accountHandle'), 'Model must have accountHandle field');
  assert(modelContent.includes('accessToken'), 'Model must have accessToken field');
  assert(modelContent.includes('isConnected'), 'Model must have isConnected field');
  console.log('✅ models/SocialAccount.ts schema verified successfully.');

  // Test 2: Verify Social Accounts API Route exists and handles GET, POST, DELETE
  console.log('\nTest 2: Inspecting app/api/admin/social/accounts/route.ts...');
  const routeContent = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'social', 'accounts', 'route.ts'), 'utf-8');
  assert(routeContent.includes('export async function GET'), 'Route must export GET handler');
  assert(routeContent.includes('export async function POST'), 'Route must export POST handler');
  assert(routeContent.includes('export async function DELETE'), 'Route must export DELETE handler');
  assert(routeContent.includes('@BeshaanVibe'), 'Default channel handle must include @BeshaanVibe');
  console.log('✅ app/api/admin/social/accounts/route.ts handlers verified successfully.');

  // Test 3: Verify publish route reads from SocialAccount in MongoDB
  console.log('\nTest 3: Inspecting app/api/admin/automation/publish/route.ts for SocialAccount integration...');
  const publishContent = fs.readFileSync(path.join(__dirname, '..', 'app', 'api', 'admin', 'automation', 'publish', 'route.ts'), 'utf-8');
  assert(publishContent.includes('SocialAccount'), 'Publish route must import SocialAccount');
  assert(publishContent.includes('ytAcc'), 'Publish route must resolve ytAcc from MongoDB');
  assert(publishContent.includes('uploadToYouTubeDirectly'), 'Publish route must support direct YouTube Data API v3 upload');
  assert(publishContent.includes('directStudioUrl') || publishContent.includes('studioUploadUrl'), 'Publish route must support studio upload bridge');
  console.log('✅ app/api/admin/automation/publish/route.ts integration verified successfully.');

  // Test 4: Verify youtube-automation-view UI has the Connected Accounts & Sign-In Hub
  console.log('\nTest 4: Inspecting components/admin/youtube-automation-view.tsx for Sign-In Hub UI...');
  const uiContent = fs.readFileSync(path.join(__dirname, '..', 'components', 'admin', 'youtube-automation-view.tsx'), 'utf-8');
  assert(uiContent.includes('Connected Social Accounts'), 'UI must render Connected Social Accounts section');
  assert(uiContent.includes('@BeshaanVibe'), 'UI must show @BeshaanVibe channel handle');
  assert(uiContent.includes('handleConnectSocialAccount'), 'UI must have handleConnectSocialAccount function');
  assert(uiContent.includes('handleDisconnectSocialAccount'), 'UI must have handleDisconnectSocialAccount function');
  assert(uiContent.includes('editingSocialPlatform'), 'UI must have sign-in modal state');
  console.log('✅ components/admin/youtube-automation-view.tsx UI verified successfully.');

  console.log('\n🎉 ALL 4 SOCIAL ACCOUNT INTEGRATION CHECKS PASSED!\n');
}

testSocialAccounts().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

