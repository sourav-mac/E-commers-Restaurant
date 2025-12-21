/**
 * OTP Data Storage Module
 * Wrapper for OTP-specific data using the dataStore
 */

const fs = require('fs')
const path = require('path')

const dataDir = path.join(process.cwd(), 'data')
const otpFilePath = path.join(dataDir, 'otps.json')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function readOTPData() {
  try {
    if (!fs.existsSync(otpFilePath)) {
      return { otps: {} }
    }
    const data = fs.readFileSync(otpFilePath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading OTP data:', err)
    return { otps: {} }
  }
}

function writeOTPData(data) {
  try {
    fs.writeFileSync(otpFilePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error('Error writing OTP data:', err)
    return false
  }
}

export function readData() {
  return readOTPData()
}

export function writeData(data) {
  return writeOTPData(data)
}
