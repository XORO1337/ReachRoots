const axios = require('axios');
const crypto = require('crypto');

class AadhaarVerificationService {
  constructor() {
    this.apiBaseUrl = process.env.AADHAAR_API_BASE_URL || 'https://api.aadhaarapi.com/v1';
    this.apiKey = process.env.AADHAAR_API_KEY;
    this.clientId = process.env.AADHAAR_CLIENT_ID;
    this.clientSecret = process.env.AADHAAR_CLIENT_SECRET;
  }

  // Validate Aadhaar number format
  validateAadhaarFormat(aadhaarNumber) {
    // Remove spaces and validate format
    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    
    // Check if it's 12 digits
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return { isValid: false, message: 'Aadhaar number must be 12 digits' };
    }

    // Validate checksum using Verhoeff algorithm
    if (!this.verifyVerhoeffChecksum(cleanAadhaar)) {
      return { isValid: false, message: 'Invalid Aadhaar number checksum' };
    }

    return { isValid: true, cleanAadhaar };
  }

  // Verhoeff algorithm for Aadhaar checksum validation
  verifyVerhoeffChecksum(aadhaarNumber) {
    const multiplication = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    const permutation = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    let checksum = 0;
    const reversedAadhaar = aadhaarNumber.split('').reverse();

    for (let i = 0; i < reversedAadhaar.length; i++) {
      checksum = multiplication[checksum][permutation[i % 8][parseInt(reversedAadhaar[i])]];
    }

    return checksum === 0;
  }

  // Send OTP to Aadhaar linked mobile number
  async sendAadhaarOTP(aadhaarNumber) {
    try {
      // For development environment, return mock response
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        console.log(`Mock Aadhaar OTP sent for: ${aadhaarNumber}`);
        return {
          success: true,
          transactionId: 'mock_txn_' + Date.now(),
          message: 'OTP sent to registered mobile number',
          mockOtp: '123456' // In development, any 6-digit OTP will work
        };
      }

      const response = await axios.post(`${this.apiBaseUrl}/send-otp`, {
        aadhaar_number: aadhaarNumber,
        client_id: this.clientId
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        transactionId: response.data.transaction_id,
        message: 'OTP sent to registered mobile number'
      };

    } catch (error) {
      console.error('Aadhaar OTP sending failed:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Failed to send OTP',
          errorCode: error.response.status
        };
      }

      throw new Error('Aadhaar OTP service unavailable. Please try again later.');
    }
  }

  // Verify OTP and get Aadhaar details
  async verifyAadhaarOTP(transactionId, otp) {
    try {
      // For development environment, return mock response
      if (process.env.NODE_ENV === 'development' && !this.apiKey) {
        console.log(`Mock Aadhaar OTP verification: ${transactionId}, OTP: ${otp}`);
        
        if (otp === '123456') {
          return {
            success: true,
            verified: true,
            aadhaarData: {
              name: 'Mock User Name',
              dateOfBirth: '01/01/1990',
              gender: 'M',
              address: {
                house: 'Mock House',
                street: 'Mock Street',
                location: 'Mock Location',
                vtc: 'Mock VTC',
                district: 'Mock District',
                state: 'Mock State',
                pincode: '123456'
              }
            }
          };
        } else {
          return {
            success: false,
            verified: false,
            message: 'Invalid OTP'
          };
        }
      }

      const response = await axios.post(`${this.apiBaseUrl}/verify-otp`, {
        transaction_id: transactionId,
        otp: otp,
        client_id: this.clientId
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.verified) {
        return {
          success: true,
          verified: true,
          aadhaarData: response.data.aadhaar_data
        };
      } else {
        return {
          success: false,
          verified: false,
          message: response.data.message || 'OTP verification failed'
        };
      }

    } catch (error) {
      console.error('Aadhaar OTP verification failed:', error);
      
      if (error.response) {
        return {
          success: false,
          verified: false,
          message: error.response.data.message || 'OTP verification failed',
          errorCode: error.response.status
        };
      }

      throw new Error('Aadhaar verification service unavailable. Please try again later.');
    }
  }

  // Generate hash for storing Aadhaar number securely
  hashAadhaarNumber(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber + process.env.AADHAAR_HASH_SALT).digest('hex');
  }

  // Mask Aadhaar number for display (show only last 4 digits)
  maskAadhaarNumber(aadhaarNumber) {
    const cleaned = aadhaarNumber.replace(/\s/g, '');
    return `XXXX XXXX ${cleaned.slice(-4)}`;
  }
}

module.exports = new AadhaarVerificationService();
