// api/get-event.js — Return event metadata + conflict map
const { getEvent, getAllEvents } = require('../lib/events');
const { conflictMap } = require('../lib/conflicts');
const { json, cors } = require('../lib/utils');

module.exports = (req, res) => {
    if(cors(req,res)) return;
    const id = req.query.event;
    const cm = conflictMap();

    if(!id) {
        // Return all events (catalog mode)
        return json(res, 200, {
            success:true,
            events: getAllEvents().map(e => ({
                eventId:e.eventId, key:e.key, norseName:e.norseName, commonName:e.commonName,
                rune:e.rune, arenaName:e.arenaName, eventDate:e.eventDate, day:e.day,
                startTime:e.startTime, endTime:e.endTime, sM:e.sM, eM:e.eM,
                minMembers:e.minMembers, maxMembers:e.maxMembers,
                imagePath:e.imagePath, isOfflineOnly:e.isOfflineOnly,
                isConflictException:e.isConflictException,
                hasRegistration:e.hasRegistration, hasRulebook:e.hasRulebook, desc:e.desc
            })),
            conflictMap: cm
        });
    }

    const ev = getEvent(id);
    if(!ev) return json(res, 404, { success:false, error:'Event not found' });

    return json(res, 200, {
        success:true,
        event: {
            eventId:ev.eventId, key:ev.key, norseName:ev.norseName, commonName:ev.commonName,
            rune:ev.rune, arenaName:ev.arenaName, eventDate:ev.eventDate, day:ev.day,
            startTime:ev.startTime, endTime:ev.endTime, sM:ev.sM, eM:ev.eM,
            minMembers:ev.minMembers, maxMembers:ev.maxMembers,
            imagePath:ev.imagePath, isOfflineOnly:ev.isOfflineOnly,
            isConflictException:ev.isConflictException,
            hasRegistration:ev.hasRegistration, hasRulebook:ev.hasRulebook, desc:ev.desc
        },
        conflicts: cm[id]||[],
        conflictMap: cm
    });
};
