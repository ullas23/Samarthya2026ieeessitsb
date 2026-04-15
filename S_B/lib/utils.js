// lib/utils.js — Utilities

function genRegId(eventKey, seq) {
    return `SAM26-${eventKey}-${String(seq).padStart(4,'0')}`;
}

function istNow() {
    return new Date(Date.now() + 5.5*3600000).toISOString().replace('Z','+05:30');
}

function json(res, status, data) {
    res.setHeader('Content-Type','application/json');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(status).json(data);
}

function cors(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers','Content-Type');
        res.status(200).end();
        return true;
    }
    return false;
}

function parseForm(req) {
    return new Promise((resolve, reject) => {
        const Busboy = require('busboy');
        const bb = Busboy({ headers: req.headers, limits: { fileSize: 5*1024*1024 } });
        const fields = {}; let file = null;
        bb.on('field', (name, val) => {
            const m = name.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
            if (m) {
                if (!fields[m[1]]) fields[m[1]] = [];
                if (!fields[m[1]][+m[2]]) fields[m[1]][+m[2]] = {};
                fields[m[1]][+m[2]][m[3]] = val;
            } else { fields[name] = val; }
        });
        bb.on('file', (name, stream, info) => {
            const chunks = [];
            stream.on('data', c => chunks.push(c));
            stream.on('end', () => { file = { buffer: Buffer.concat(chunks), filename: info.filename, mime: info.mimeType }; });
        });
        bb.on('finish', () => resolve({ fields, file }));
        bb.on('error', reject);
        if (req.body && Buffer.isBuffer(req.body)) bb.end(req.body);
        else if (typeof req.body === 'string') bb.end(Buffer.from(req.body));
        else req.pipe(bb);
    });
}

module.exports = { genRegId, istNow, json, cors, parseForm };
