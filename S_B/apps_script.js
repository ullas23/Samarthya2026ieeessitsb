// Google Apps Script Backend for Samarthya 2026

const SHEET_ID = '1QrzsrdfZxFlqJnXH9Q190guJZzvnhLvbxtMz-lY0-vk'; // User's Spreadsheet
const SHEET_NAME = 'reg_details';
const APP_FOLDER_ID = '14a-YUmcbh84CSHMRxyX6LylhcA59zlDH'; // Drive Folder ID from user

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const {
      eventName, name, phone, email, usn,
      college, city, utr, paymentScreenshotData, screenshotName, screenshotMime, teamMembers, gameChoice
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
        'Timestamp', 'Reg ID', 'Event', 'Game', 'Lead Name', 'Lead Phone', 'Lead Email', 'Lead USN', 'Lead College', 'City', 'UTR', 'Screenshot URL',
        'Member 2 Name', 'Member 2 Email', 'Member 2 USN', 'Member 2 College',
        'Member 3 Name', 'Member 3 Email', 'Member 3 USN', 'Member 3 College',
        'Member 4 Name', 'Member 4 Email', 'Member 4 USN', 'Member 4 College'
      ]);
    }

    sheet.appendRow([
      new Date(),
      regId,
      eventName,
      gameChoice || 'N/A',
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

    // 3. Send Confirmation Emails (Norse Themed HTML)
    const subject = `🛡️ Samarthya 2026: Registration Confirmed - ${eventName}`;
    
    const htmlTemplate = (recipientName) => `
      <div style="background-color: #050d1a; color: #e8f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border: 2px solid #c8a84b; max-width: 600px; margin: auto; box-shadow: 0 0 20px rgba(200, 168, 75, 0.2);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c8a84b; font-family: 'Georgia', serif; letter-spacing: 4px; border-bottom: 1px solid rgba(200, 168, 75, 0.3); padding-bottom: 10px; text-transform: uppercase;">Samarthya 2026</h1>
          <p style="color: #00d4ff; font-family: monospace; letter-spacing: 2px;">ᚠᚢᚦᚨᚱᚲ · FORGE OF INNOVATION · ᚠᚢᚦᚨᚱᚲ</p>
        </div>
        
        <div style="line-height: 1.6; font-size: 16px;">
          <p>Hail <strong style="color: #c8a84b;">${recipientName}</strong>,</p>
          <p>Your registration for the trial of <strong>${eventName}</strong> has been received and sanctioned by the council of innovators.</p>
          
          <div style="background: rgba(200, 168, 75, 0.1); border-left: 4px solid #c8a84b; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Registration ID</p>
            <p style="margin: 5px 0 0 0; color: #c8a84b; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${regId}</p>
          </div>

          <p>Prepare yourself, for the gates of the Arena shall soon open. May the Norns weave a prosperous fate for your journey in Samarthya 2026.</p>
          
          <p style="margin-top: 40px; font-style: italic; color: rgba(232, 244, 248, 0.6);">"Only those with the heart of a warrior and the mind of a craftsman shall leave their mark upon the Sagas."</p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(200, 168, 75, 0.2); text-align: center; font-size: 12px; color: rgba(232, 244, 248, 0.4);">
          <p>© 2026 IEEE SSIT Student Branch · SSIT, Tumakuru</p>
          <p>ᚠᚢᚦᚨᚱᚲ · ᚷᛟᚱᚷᛖ · ᛟᚠ · ᛁᚾᚾᛟᚠᚨᛏᛁᛟᚾ</p>
        </div>
      </div>
    `;

    try {
      const emailOptions = (name) => ({
        htmlBody: htmlTemplate(name),
        name: "Samarthya 2026"
      });

      GmailApp.sendEmail(email, subject, "", emailOptions(name));
      if (teamMembers) {
        teamMembers.forEach(tm => {
          if (tm.email) {
            GmailApp.sendEmail(tm.email, subject, "", emailOptions(tm.name));
          }
        });
      }
    } catch (emailError) {
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
