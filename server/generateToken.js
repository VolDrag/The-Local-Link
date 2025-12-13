//Rafi
// Generate JWT token for testing
import jwt from 'jsonwebtoken';

const userId = "6938cb05cf3a99b0eff722ff";
const email = "ahmed@example.com";
const role = "provider";
const secret = "M328ZugZGmffws21bwqPVZNy3W9O+/ErM8jJeeX+mwE=";

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
