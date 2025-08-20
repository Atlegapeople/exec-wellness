const { spawn } = require('child_process');
const net = require('net');

// Check if port is open
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is OPEN on ${host}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${port} TIMEOUT on ${host}`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      console.log(`❌ Port ${port} CLOSED on ${host}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function findPostgreSQL() {
  console.log('🔍 Checking for PostgreSQL...\n');
  
  // Check common PostgreSQL ports
  const hosts = ['localhost', '127.0.0.1'];
  const ports = [5432, 5433, 5434, 5435];
  
  for (const host of hosts) {
    for (const port of ports) {
      console.log(`🧪 Checking ${host}:${port}...`);
      const isOpen = await checkPort(host, port);
      if (isOpen) {
        console.log(`\n🎯 Found service on ${host}:${port}!`);
        console.log(`Try updating your .env.local:`);
        console.log(`DATABASE_URL="postgresql://postgres:postgress@${host}:${port}/ohms_local"`);
        return;
      }
    }
  }
  
  console.log('\n🔍 No PostgreSQL found on common ports.');
  console.log('\n💡 Please check:');
  console.log('1. Is PostgreSQL service running in Windows Services?');
  console.log('2. Is it running in Docker? (docker ps)');
  console.log('3. What port does pgAdmin use to connect?');
  console.log('4. Is it WSL vs Windows PostgreSQL?');
  
  // Check for postgres processes
  console.log('\n🔍 Checking for postgres processes...');
  
  try {
    const { exec } = require('child_process');
    exec('tasklist | findstr postgres', (error, stdout, stderr) => {
      if (stdout) {
        console.log('📋 Found postgres processes:');
        console.log(stdout);
      } else {
        console.log('❌ No postgres processes found');
      }
    });
  } catch (e) {
    console.log('❌ Could not check processes');
  }
}

findPostgreSQL();