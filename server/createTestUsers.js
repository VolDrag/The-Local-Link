import fetch from 'node-fetch';

const testUsers = [
  {
    email: 'edenhazard@mail.com',
    password: 'Edenhazard123!',
    username: 'eden_hazard',
    firstName: 'Eden',
    lastName: 'Hazard',
    role: 'seeker'
  },
  {
    email: 'johndoe@mail.com',
    password: 'John123!',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'provider'
  },
  {
    email: 'janedoe@mail.com',
    password: 'Jane123!',
    username: 'jane_doe',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'seeker'
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');
  
  for (const user of testUsers) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${user.role.toUpperCase()} created: ${user.email}`);
      } else {
        console.log(`⚠️  ${user.email}: ${data.message || 'Failed'}`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
  }
  
  console.log('\n✅ Test users creation completed!');
}

createTestUsers();
