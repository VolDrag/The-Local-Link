//Debashish

import crypto from 'crypto';

export function generate6DigitCode() {
  return (crypto.randomInt(100000, 1000000)).toString();
}