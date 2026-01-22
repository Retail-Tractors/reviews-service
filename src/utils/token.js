// const jwt = require("jsonwebtoken");
const jose = require("jose");
const crypto = require("crypto");
require("dotenv").config();

const privateKey = process.env.BOOKING_PRIVATE_KEY.replace(/\\n/g, "\n");

async function generateBookingToken(payload) {
  const importedKey = await jose.importPKCS8(privateKey, "RS256");
  
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setExpirationTime(process.env.BOOKING_JWT_EXPIRATION)
    .sign(importedKey);
}

module.exports = { generateBookingToken };

async function generateBookingToken(payload) {
  const envKey = process.env.BOOKING_PRIVATE_KEY;

  if (!envKey) {
    throw new Error("ERROR: BOOKING_PRIVATE_KEY environment variable is not set.");
  }

  const privateKeyPem = envKey.replace(/\\n/g, "\n");

  try {
    // ALTERAÇÃO CRÍTICA:
    // Usamos o módulo 'crypto' do Node.js para importar a chave.
    // O 'crypto.createPrivateKey' é inteligente e aceita tanto:
    // 1. PKCS#1 ("-----BEGIN RSA PRIVATE KEY-----") -> O que tu tens
    // 2. PKCS#8 ("-----BEGIN PRIVATE KEY-----") -> O padrão novo
    const privateKeyObj = crypto.createPrivateKey(privateKeyPem);
    
    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt()
      .setExpirationTime(process.env.BOOKING_JWT_EXPIRATION || '1h')
      .sign(privateKeyObj);

  } catch (error) {
    console.error("error:", error.message);
    throw new Error("Failed to generate booking token.");
  }
}

module.exports = { generateBookingToken };