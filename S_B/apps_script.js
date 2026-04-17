// Google Apps Script Backend for Samarthya 2026

const SHEET_ID = '1QrzsrdfZxFlqJnXH9Q190guJZzvnhLvbxtMz-lY0-vk'; // User's Spreadsheet
const SHEET_NAME = 'reg_details';
const APP_FOLDER_ID = '14a-YUmcbh84CSHMRxyX6LylhcA59zlDH'; // Drive Folder ID from user

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const {
      eventName, name, phone, email, usn,
      college, city, utr, paymentScreenshotData, screenshotName, screenshotMime, teamMembers
    } = data;

    // Generate Registration ID
    const regId = 'SAM26-' + eventName.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    // Format team details - Extract to separate columns
    let m2Name = '', m2Email = '', m2Usn = '', m2College = '';
    let m3Name = '', m3Email = '', m3Usn = '', m3College = '';
    let m4Name = '', m4Email = '', m4Usn = '', m4College = '';

    if (teamMembers) {
      if (teamMembers[0]) {
        m2Name = teamMembers[0].name || ''; m2Email = teamMembers[0].email || ''; m2Usn = teamMembers[0].usn || ''; m2College = teamMembers[0].college || '';
      }
      if (teamMembers[1]) {
        m3Name = teamMembers[1].name || ''; m3Email = teamMembers[1].email || ''; m3Usn = teamMembers[1].usn || ''; m3College = teamMembers[1].college || '';
      }
      if (teamMembers[2]) {
        m4Name = teamMembers[2].name || ''; m4Email = teamMembers[2].email || ''; m4Usn = teamMembers[2].usn || ''; m4College = teamMembers[2].college || '';
      }
    }

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
      sheet.appendRow([
        'Timestamp', 'Reg ID', 'Event', 'Lead Name', 'Lead Phone', 'Lead Email', 'Lead USN', 'Lead College', 'City', 'UTR', 'Screenshot URL',
        'Member 2 Name', 'Member 2 Email', 'Member 2 USN', 'Member 2 College',
        'Member 3 Name', 'Member 3 Email', 'Member 3 USN', 'Member 3 College',
        'Member 4 Name', 'Member 4 Email', 'Member 4 USN', 'Member 4 College'
      ]);
    }

    sheet.appendRow([
      new Date(),
      regId,
      eventName,
      name,
      phone,
      email,
      usn,
      college,
      city || '',
      utr,
      screenshotUrl,
      m2Name, m2Email, m2Usn, m2College,
      m3Name, m3Email, m3Usn, m3College,
      m4Name, m4Email, m4Usn, m4College
    ]);

    // 3. Send Confirmation Emails
    const subject = `Samarthya 2026 Registration Confirmed - ${eventName}`;
    const messageTemplate = (recipientName) => `Hail ${recipientName},\n\nYour registration for the trial of ${eventName} has been received and confirmed by the gods.\nYour Registration ID is: ${regId}\n\nPrepare yourself for the upcoming challenges in Samarthya 2026.\n\nMay the Norns weave a prosperous fate for you.\n\nBest regards,\nIEEE SSIT Student Branch`;

    try {
      GmailApp.sendEmail(email, subject, messageTemplate(name));
      if (teamMembers) {
        teamMembers.forEach(tm => {
          if (tm.email) {
            GmailApp.sendEmail(tm.email, subject, messageTemplate(tm.name));
          }
        });
      }
    } catch (emailError) {
      // Ignore email failure so registration succeeds even if email bounds hit
      console.log('Email Error: ' + emailError.toString());
    }

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
