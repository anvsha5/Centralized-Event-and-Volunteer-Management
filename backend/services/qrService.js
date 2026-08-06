const QRCode = require('qrcode');

/**
 * Generates a high-quality PNG Data URL representation of a QR code
 * for the given QR token string using the `qrcode` library.
 *
 * @param {string} token - The unique QR token string to encode.
 * @returns {Promise<string>} High quality PNG Data URL.
 */
async function generateQR(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('QR token must be a non-empty string');
  }

  const options = {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 4,
    width: 400,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  return await QRCode.toDataURL(token, options);
}

module.exports = {
  generateQR,
};
