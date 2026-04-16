const payload = {
  eventName: "Valhalla",
  eventId: "valhalla",
  name: "Test Agent",
  phone: "1234567890",
  email: "test@example.com",
  usn: "TEST001",
  college: "SSIT",
  location: "Midgard",
  utr: "111122223333",
  screenshotName: "test.png",
  screenshotMime: "image/png",
  paymentScreenshotData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" 
};

fetch('https://script.google.com/macros/s/AKfycbwsTxwccDKtNwsH6ZXITFMYcAcXrLsbcUiNvqEDUR74vNpAMWl5f36hBJhvI1-7KKw/exec', {
  method: 'POST',
  body: JSON.stringify(payload),
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
