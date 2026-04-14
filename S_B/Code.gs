const SPREADSHEET_ID  = "https://docs.google.com/spreadsheets/d/1k1Syxcx8Ckf64jTJboZ_wxNL6PWVvHiD1l8vn5cPP4U/edit?gid=0#gid=0";
const DRIVE_FOLDER_ID = "https://drive.google.com/drive/folders/1fGH-7SP5uSneCdBYqj0llgyjRFXK_qFn";
const ADMIN_EMAIL     = "sankethmanomay@gmail.com";
const IST_OFFSET      = 5.5 * 60 * 60 * 1000;

function doGet(e) {
  return HtmlService.createHtmlOutput("✅ Samarthya 2026 Backend is Live");
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    setupSheets();
    
    // Check for duplicate UTR
    const duplicateCheck = checkDuplicate(data.utrNumber);
    if (duplicateCheck.isDuplicate) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "UTR already used. Your ID: " + duplicateCheck.existingId 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const regId = generateRegistrationId();
    const timestamp = getISTTimestamp();
    
    // Upload payment screenshot
    const paymentFileName = `${regId}_payment.jpg`;
    const paymentUrl = uploadFile(data.paymentScreenshot, paymentFileName, "image/jpeg");
    
    if (data.type === 'individual') {
      const photoFileName = `${regId}_photo.jpg`;
      const photoUrl = uploadFile(data.photo, photoFileName, "image/jpeg");
      saveIndividual(data, regId, timestamp, paymentUrl, photoUrl);
    } else if (data.type === 'group') {
      const memberPhotoUrls = [];
      for (let i = 0; i < data.members.length; i++) {
        const memberPhotoFileName = `${regId}_member${i+1}_photo.jpg`;
        const memberPhotoUrl = uploadFile(data.members[i].photo, memberPhotoFileName, "image/jpeg");
        memberPhotoUrls.push(memberPhotoUrl);
      }
      saveGroup(data, regId, timestamp, paymentUrl, memberPhotoUrls);
    }
    
    logPayment(regId, timestamp, data.eventName, data.type, data.utrNumber, paymentUrl);
    sendConfirmationEmail(data, regId);
    notifyAdmin(data, regId);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      registrationId: regId 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheets() {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/); // Automatically handles both ID and full URL
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  
  const indHeaders = ["Reg ID", "Timestamp (IST)", "Event", "Name", "USN", "Branch", "Section", "Email", "Phone", "UTR", "Payment URL", "Photo URL", "Status"];
  const grpHeaders = ["Reg ID", "Timestamp (IST)", "Event", "Team Name", "UTR", "Payment URL"];
  for (let i = 1; i <= 4; i++) {
    grpHeaders.push(`M${i} Name`, `M${i} USN`, `M${i} Branch`, `M${i} Section`, `M${i} Email`, `M${i} Phone`, `M${i} Photo URL`);
  }
  grpHeaders.push("Status");
  
  const paymentHeaders = ["Reg ID", "Timestamp", "Event", "Type", "UTR", "Screenshot URL", "Status"];
  
  const sheetsInfo = [
    { name: "Individual_Registrations", headers: indHeaders },
    { name: "Group_Registrations", headers: grpHeaders },
    { name: "Payment_Log", headers: paymentHeaders }
  ];
  
  sheetsInfo.forEach(info => {
    let sheet = ss.getSheetByName(info.name);
    if (!sheet) {
      sheet = ss.insertSheet(info.name);
      sheet.appendRow(info.headers);
      const range = sheet.getRange(1, 1, 1, info.headers.length);
      range.setFontWeight("bold");
      range.setBackground("#c8a84b");
      range.setFontColor("#020408");
      sheet.setFrozenRows(1);
    }
  });
}

function generateRegistrationId() {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/);
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  const indSheet = ss.getSheetByName("Individual_Registrations");
  const grpSheet = ss.getSheetByName("Group_Registrations");
  
  let indCount = 0;
  if (indSheet) {
    const indLastRow = indSheet.getLastRow();
    indCount = indLastRow > 1 ? indLastRow - 1 : 0;
  }
  
  let grpCount = 0;
  if (grpSheet) {
    const grpLastRow = grpSheet.getLastRow();
    grpCount = grpLastRow > 1 ? grpLastRow - 1 : 0;
  }
  
  const total = indCount + grpCount;
  return "SAM-" + String(total + 1).padStart(4, '0');
}

function getISTTimestamp() {
  const date = new Date(new Date().getTime() + IST_OFFSET);
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = date.getUTCFullYear();
  const HH = String(date.getUTCHours()).padStart(2, '0');
  const MM = String(date.getUTCMinutes()).padStart(2, '0');
  const SS = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${dd}-${mm}-${yyyy} ${HH}:${MM}:${SS} IST`;
}

function uploadFile(base64String, fileName, mimeType) {
  const folderId = DRIVE_FOLDER_ID.match(/[-\w]{25,}/);
  const folder = DriveApp.getFolderById(folderId ? folderId[0] : DRIVE_FOLDER_ID);
  const decoded = Utilities.base64Decode(base64String);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/file/d/" + file.getId() + "/view";
}

function checkDuplicate(utrNumber) {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/);
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  
  const indSheet = ss.getSheetByName("Individual_Registrations");
  if (indSheet && indSheet.getLastRow() > 1) {
    const indData = indSheet.getRange(2, 1, indSheet.getLastRow() - 1, 11).getValues();
    for (let i = 0; i < indData.length; i++) {
        if (indData[i][9] == utrNumber) { // UTR in column 10 (index 9), RegId in col 1 (index 0)
            return { isDuplicate: true, existingId: indData[i][0] };
        }
    }
  }
  
  const grpSheet = ss.getSheetByName("Group_Registrations");
  if (grpSheet && grpSheet.getLastRow() > 1) {
    const grpData = grpSheet.getRange(2, 1, grpSheet.getLastRow() - 1, 5).getValues();
    for (let i = 0; i < grpData.length; i++) {
        if (grpData[i][4] == utrNumber) { // UTR in column 5 (index 4), RegId in col 1 (index 0)
            return { isDuplicate: true, existingId: grpData[i][0] };
        }
    }
  }
  
  return { isDuplicate: false };
}

function saveIndividual(data, regId, timestamp, paymentUrl, photoUrl) {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/);
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Individual_Registrations");
  
  sheet.appendRow([regId, timestamp, data.eventName, data.name, data.usn, data.branch, data.section, data.email, data.phone, data.utrNumber, paymentUrl, photoUrl, "Pending"]);
  
  // Format alternating colors
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, 13);
  const bgColor = (lastRow % 2 === 0) ? "#0d1b2e" : "#071020";
  range.setBackground(bgColor);
  range.setFontColor("#e8f4f8");
}

function saveGroup(data, regId, timestamp, paymentUrl, memberPhotoUrls) {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/);
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Group_Registrations");
  
  const row = [regId, timestamp, data.eventName, data.teamName, data.utrNumber, paymentUrl];
  
  for (let i = 0; i < 4; i++) {
    if (data.members && data.members[i]) {
      const member = data.members[i];
      const photoUrl = i < memberPhotoUrls.length ? memberPhotoUrls[i] : "";
      row.push(member.name, member.usn, member.branch, member.section, member.email, member.phone, photoUrl);
    } else {
      row.push("", "", "", "", "", "", "");
    }
  }
  
  row.push("Pending");
  sheet.appendRow(row);
  
  // Format alternating colors
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, row.length);
  const bgColor = (lastRow % 2 === 0) ? "#0d1b2e" : "#071020";
  range.setBackground(bgColor);
  range.setFontColor("#e8f4f8");
}

function logPayment(regId, timestamp, eventName, type, utrNumber, screenshotUrl) {
  const ssId = SPREADSHEET_ID.match(/[-\w]{25,}/);
  const ss = SpreadsheetApp.openById(ssId ? ssId[0] : SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Payment_Log");
  
  sheet.appendRow([regId, timestamp, eventName, type, utrNumber, screenshotUrl, "Pending"]);
  
  // Format alternating colors
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, 7);
  const bgColor = (lastRow % 2 === 0) ? "#0d1b2e" : "#071020";
  range.setBackground(bgColor);
  range.setFontColor("#e8f4f8");
}

function sendConfirmationEmail(data, regId) {
  const subject = "SAMARTHYA 2026 - Registration Confirmed";
  const eventName = data.eventName;
  const utr = data.utrNumber;
  
  const getHtmlBody = (name) => `
<div style="font-family:Arial,sans-serif;background:#020408;color:#e8f4f8;padding:30px;max-width:600px;margin:auto;border:1px solid #c8a84b;">
  <h1 style="color:#c8a84b;text-align:center;letter-spacing:4px;">⚡ SAMARTHYA 2026 ⚡</h1>
  <h2 style="color:#00d4ff;text-align:center;">Registration Confirmed</h2>
  <p>Dear ${name},</p>
  <p>Your registration for <strong style="color:#c8a84b">${eventName}</strong> is confirmed.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;">
    <tr><td style="padding:10px;border:1px solid #1a2a40;color:#aaa;">Registration ID</td><td style="padding:10px;border:1px solid #1a2a40;color:#c8a84b;font-weight:bold;">${regId}</td></tr>
    <tr style="background:#071020"><td style="padding:10px;border:1px solid #1a2a40;color:#aaa;">Event</td><td style="padding:10px;border:1px solid #1a2a40;">${eventName}</td></tr>
    <tr><td style="padding:10px;border:1px solid #1a2a40;color:#aaa;">UTR Number</td><td style="padding:10px;border:1px solid #1a2a40;">${utr}</td></tr>
    <tr style="background:#071020"><td style="padding:10px;border:1px solid #1a2a40;color:#aaa;">Payment Status</td><td style="padding:10px;border:1px solid #1a2a40;color:#f39c12;">⏳ Pending Verification</td></tr>
  </table>
  <p style="color:#aaa;">Carry your Registration ID on the day of the event.</p>
  <p style="color:#c8a84b;text-align:center;letter-spacing:3px;">See you in the arena. ⚡</p>
  <p style="text-align:center;color:#555;font-size:12px;">— Team IEEE SSIT Student Branch</p>
</div>
`;

  if (data.type === 'individual') {
    GmailApp.sendEmail(data.email, subject, "", { htmlBody: getHtmlBody(data.name) });
  } else if (data.type === 'group') {
    for (let i = 0; i < data.members.length; i++) {
        if (data.members[i] && data.members[i].email) {
            GmailApp.sendEmail(data.members[i].email, subject, "", { htmlBody: getHtmlBody(data.members[i].name) });
        }
    }
  }
}

function notifyAdmin(data, regId) {
  const subject = `[SAM REG] ${regId} — ${data.eventName}`;
  let body = `New Registration Received!\n\n`;
  body += `Reg ID: ${regId}\n`;
  body += `Event: ${data.eventName}\n`;
  body += `Type: ${data.type}\n`;
  body += `UTR: ${data.utrNumber}\n\n`;
  
  if (data.type === 'individual') {
    body += `Name: ${data.name}\n`;
    body += `USN: ${data.usn}\n`;
    body += `Branch: ${data.branch}\n`;
    body += `Section: ${data.section}\n`;
    body += `Phone: ${data.phone}\n`;
    body += `Email: ${data.email}\n`;
  } else if (data.type === 'group') {
    body += `Team Name: ${data.teamName}\n\n`;
    for (let i = 0; i < data.members.length; i++) {
       const m = data.members[i];
       body += `Member ${i+1}:\n`;
       body += `  Name: ${m.name}\n`;
       body += `  USN: ${m.usn}\n`;
       body += `  Branch: ${m.branch}\n`;
       body += `  Section: ${m.section}\n`;
       body += `  Phone: ${m.phone}\n`;
       body += `  Email: ${m.email}\n\n`;
    }
  }
  
  GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

/*
SETUP INSTRUCTIONS — SAMARTHYA 2026 BACKEND

STEP 1: Create Google Sheet
  - Go to sheets.google.com → create new spreadsheet
  - Name it "Samarthya 2026 Registrations"
  - Copy the ID from the URL (between /d/ and /edit)
  - Paste into SPREADSHEET_ID constant above

STEP 2: Create Drive Folder
  - Go to drive.google.com → New → Folder
  - Name it "Samarthya2026_Payments"
  - Open the folder → copy ID from URL (after /folders/)
  - Paste into DRIVE_FOLDER_ID constant above

STEP 3: Set Up Apps Script
  - Go to script.google.com → New Project
  - Name it "Samarthya2026 Backend"
  - Delete default code, paste this entire Code.gs
  - Save (Ctrl+S)

STEP 4: Deploy as Web App
  - Click Deploy → New Deployment
  - Type: Web App
  - Execute as: Me
  - Who has access: Anyone
  - Click Deploy → copy the Web App URL

STEP 5: Connect to Frontend
  - Open index.html
  - Find: const APPS_SCRIPT_URL = "YOUR_WEB_APP_URL_HERE"
  - Replace with your copied URL

STEP 6: Test
  - Open your website, submit a test registration
  - Check Google Sheet for new row
  - Check Drive folder for uploaded screenshots
  - Check your email for admin notification

STEP 7: Re-deploying after edits
  - Deploy → Manage Deployments → Edit → New Version → Deploy
  - URL stays the same, no need to update frontend

NOTE: Frontend fetch() must NOT include Content-Type header.
Apps Script doPost() breaks if Content-Type is set manually.
*/
