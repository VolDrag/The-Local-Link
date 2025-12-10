import fetch from 'node-fetch';

const adminData = {
  email: 'admin@locallink.com',
  password: 'admin123',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  adminLevel: 'super_admin'
};

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    console.log('Admin created successfully:', data);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

createAdmin();
