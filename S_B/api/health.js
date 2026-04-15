// api/health.js
module.exports = (req, res) => {
    res.status(200).json({ status:'ok', service:'Samarthya 2026', ts: new Date().toISOString() });
};
