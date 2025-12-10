//Rafi
// Generate JWT token for testing
import jwt from 'jsonwebtoken';

const userId = "69382eb83cd7d84220ec64b9";
const email = "ahmed@example.com";
const role = "provider";
const secret = "your_secret_key_here_change_this_in_production";

const token = jwt.sign(
  { id: userId, email: email, role: role },
  secret,
  { expiresIn: '7d' }
);

console.log('\n=================================');
console.log('JWT Token for ahmed_plumber:');
console.log('=================================\n');
console.log(token);
console.log('\n=================================');
console.log('Copy this token and use it in Postman');
console.log('=================================\n');
