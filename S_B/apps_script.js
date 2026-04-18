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
        'Timestamp', 'Reg ID', 'Event', 'Game Choice', 'Lead Name', 'Lead Phone', 'Lead Email', 'Lead USN', 'Lead College', 'City', 'UTR', 'Screenshot URL',
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



    const htmlTemplate = (recipientName) => {
      const gameInfo = (gameChoice && gameChoice !== 'N/A') ? `
        <div style="margin-top: 10px; color: #00d4ff; font-family: monospace; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Battleground: ${gameChoice}
        </div>` : '';

      return `
      <div style="background-color: #050d1a; color: #e8f4f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 0; border: 1px solid #c8a84b; max-width: 600px; margin: auto; overflow: hidden;">
        <!-- Font Import (Note: Some email clients may not support web fonts) -->
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Cinzel:wght@700&display=swap');
        </style>
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #0a1628, #050d1a); padding: 45px 20px; text-align: center; border-bottom: 2px solid #c8a84b;">
          <h1 style="color: #c8a84b; font-family: 'Cinzel Decorative', 'Georgia', serif; letter-spacing: 5px; margin: 0; text-transform: uppercase; font-size: 36px; text-shadow: 0 0 15px rgba(200, 168, 75, 0.4); font-weight: 700;">Samarthya 2026</h1>
          <div style="color: #00d4ff; font-family: 'Cinzel', 'Courier New', monospace; font-size: 10px; letter-spacing: 4px; margin-top: 12px; font-weight: 700;">ᚠᚢᚦᚨᚱᚲ · FORGE OF INNOVATION · ᚠᚢᚦᚨᚱᚲ</div>
        </div>
        
        <!-- Content Area -->
        <div style="padding: 40px 35px; background-image: radial-gradient(circle at 50% 50%, rgba(200, 168, 75, 0.04) 0%, transparent 80%);">
          <p style="font-size: 20px; color: #c8a84b; font-family: 'Cinzel', 'Georgia', serif; margin-bottom: 25px;">Hail ${recipientName},</p>
          
          <p style="line-height: 1.8; font-size: 15px; color: #d8e4e8;">
            Your registration for the trial of <strong style="color: #00d4ff;">${eventName}</strong> has been secured in the archives of the Nine Realms.
          </p>
          
          ${gameInfo}

          <!-- Registration ID Box -->
          <div style="background: rgba(200, 168, 75, 0.05); border: 1px dashed rgba(200, 168, 75, 0.3); padding: 25px; margin: 30px 0; text-align: center; position: relative;">
            <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">Your Runic Event ID</div>
            <div style="font-size: 28px; color: #c8a84b; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', Courier, monospace;">${regId}</div>
          </div>

          <p style="line-height: 1.8; font-size: 15px; color: #d8e4e8;">
            Prepare yourself, for the gates of the <strong style="color: #c8a84b;">Arena</strong> shall open on April 22nd. May your skills be sharp and your code be legendary. 
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(200, 168, 75, 0.1); font-style: italic; color: rgba(232, 244, 248, 0.5); font-size: 13px; text-align: center;">
            "Wait for the signal. The gods favor the bold."
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #030810; padding: 20px; text-align: center; font-size: 11px; color: rgba(232, 244, 248, 0.3); border-top: 1px solid rgba(200, 168, 75, 0.2);">
          <p style="margin: 5px 0; letter-spacing: 1px;">IEEE SSIT Student Branch · SSIT, Tumakuru</p>
          <p style="margin: 5px 0;">22 & 23 April 2026</p>
        </div>
      </div>
    `;
    };

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
