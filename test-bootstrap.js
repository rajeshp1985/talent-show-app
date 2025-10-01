// Test script to verify bootstrap functionality
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('Testing bootstrap data loading...\n');

// Test the same logic as in the API
const getBootstrapData = () => {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'events-data.json');
    console.log('Reading bootstrap data from:', filePath);
    
    const fileContent = readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log('Bootstrap data loaded successfully:');
    console.log('- Events:', jsonData.events?.length || 0);
    console.log('- Current Event:', jsonData.currentEvent ? 'Yes' : 'None');
    console.log('- Finished Events:', jsonData.finishedEvents?.length || 0);
    console.log('- Last Updated:', jsonData.lastUpdated);
    
    return jsonData;
  } catch (error) {
    console.error('Error reading events-data.json:', error.message);
    return null;
  }
};

// Run the test
const data = getBootstrapData();

if (data) {
  console.log('\n✅ Bootstrap data loading test PASSED');
  console.log('\nSample event data:');
  if (data.events && data.events.length > 0) {
    console.log('First event:', JSON.stringify(data.events[0], null, 2));
  }
} else {
  console.log('\n❌ Bootstrap data loading test FAILED');
}
