// Google Apps Script Backend for Samarthya 2026

const SHEET_ID = '1_g_dEKemzA0D1KMY1PFDKNdnqXPb4ZOoWYi_IpQqKPM'; // User's Spreadsheet
const SHEET_NAME = 'Registrations';
const APP_FOLDER_ID = '14a-YUmcbh84CSHMRxyX6LylhcA59zlDH'; // Drive Folder ID from user

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { 
      eventName, name, phone, email, usn, 
      college, location, utr, paymentScreenshotData, screenshotName, screenshotMime 
    } = data;
    
    // 1. Save Screenshot to Drive
    let screenshotUrl = '';
    if (paymentScreenshotData) {
      const folder = DriveApp.getFolderById(APP_FOLDER_ID);
      const decodedFile = Utilities.base64Decode(paymentScreenshotData);
      const blob = Utilities.newBlob(decodedFile, screenshotMime, `${Date.now()}_${name}_${eventName}_${screenshotName}`);
      const file = folder.createFile(blob);
      screenshotUrl = file.getUrl();
    }
    
    // 2. Append to Spreadsheet
    const doc = SpreadsheetApp.openById(SHEET_ID);
    let sheet = doc.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Event', 'Name', 'Phone', 'Email', 'USN', 'College', 'Location/Team', 'UTR', 'Screenshot URL']);
    }
    
    sheet.appendRow([
      new Date(),
      eventName,
      name,
      phone,
      email,
      usn,
      college,
      location,
      utr,
      screenshotUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Registration successful!' 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handling CORS Preflight Options Request
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
