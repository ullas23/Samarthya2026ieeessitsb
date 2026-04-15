// =============================================
// Js/events/events-data.js — Client-Side Event Metadata
// =============================================
// Mirror of lib/events.js for frontend use.
// Loaded by both index.html and register.html.
// =============================================

const EVENTS_DATA = [
    // === DAY 1: AWAKENING — 22 April ===
    { eventId: 'valhalla',  norse: 'Valhalla',  common: 'E-Games',              rune: 'ᚠ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 4, maxMembers: 4, imagePath: 'Assets/valhalla.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '09:00', endTime: '11:00', startMinutes: 540, endMinutes: 660, isConflictException: false, desc: 'Enter the digital colosseum. Compete in the ultimate gaming trials and prove your mastery in the electronic arena. Warriors of the virtual realm, your legend awaits.' },
    { eventId: 'helheim',   norse: 'Helheim',   common: 'Escape Room',          rune: 'ᚢ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 3, maxMembers: 3, imagePath: 'Assets/helheim.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '09:00', endTime: '15:00', startMinutes: 540, endMinutes: 900, isConflictException: true, desc: 'Venture into the shadowed realm. Solve cryptic puzzles, decode ancient mysteries, and escape the labyrinth before time runs out. Only the cleverest minds shall find the light.' },
    { eventId: 'saga',      norse: 'Saga',      common: 'Quiz',                 rune: 'ᚦ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 1, maxMembers: 2, imagePath: 'Assets/saga.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '11:15', endTime: '12:15', startMinutes: 675, endMinutes: 735, isConflictException: false, desc: 'Channel the wisdom of the ages. Test your knowledge across technology, science, and engineering in this epic battle of intellect and quick thinking.' },
    { eventId: 'eitri',     norse: 'Eitri',     common: 'Project Expo',         rune: 'ᛇ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 1, maxMembers: 3, imagePath: 'Assets/eitri.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '12:20', endTime: '14:00', startMinutes: 740, endMinutes: 840, isConflictException: false, desc: 'Present the fruits of your forge. Showcase your technical projects, innovations, and research to judges and peers in this celebration of engineering achievement.' },
    { eventId: 'seidr',     norse: 'Seidr',     common: 'Reverse Engineering',  rune: 'ᚱ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 1, maxMembers: 2, imagePath: 'Assets/seidr.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '12:30', endTime: '13:30', startMinutes: 750, endMinutes: 810, isConflictException: false, desc: 'Unravel the ancient code. Dissect, analyze, and reconstruct — working backwards from the known to reveal the unknown. A trial of deep technical mastery.' },
    { eventId: 'runes',     norse: 'Runes',     common: 'Spell Bee',            rune: 'ᚹ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/runes.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '12:30', endTime: '13:30', startMinutes: 750, endMinutes: 810, isConflictException: false, desc: 'Command the power of language itself. Spell your way to victory through technical jargon, scientific terminology, and the arcane vocabulary of modern engineering.' },
    { eventId: 'runecraft', norse: 'Runecraft', common: 'Coding',               rune: 'ᚷ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/runecraft.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '09:00', endTime: '11:00', startMinutes: 540, endMinutes: 660, isConflictException: false, desc: 'Forge solutions from pure logic. Write elegant, efficient code to conquer algorithmic challenges and emerge as the supreme craftsman of the digital realm.' },
    { eventId: 'bifrost',   norse: 'Bifrost',   common: 'Treasure Hunt',        rune: 'ᚲ', arenaName: 'Awakening', arena: 'awakening', eventDate: '22 April 2026', day: 1, dateLabel: '22 April', minMembers: 4, maxMembers: 4, imagePath: 'Assets/bifrost.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '14:30', endTime: '17:30', startMinutes: 870, endMinutes: 1050, isConflictException: false, desc: 'Follow the rainbow bridge across the campus. Decode clues, unravel mysteries, and navigate the hidden pathways of SSIT in this epic multi-stage adventure.' },
    // === DAY 2: RAGNAROK — 23 April ===
    { eventId: 'volva',     norse: 'Volva',     common: 'Kaggle Competition',   rune: 'ᚨ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/volva.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '09:00', endTime: '11:00', startMinutes: 540, endMinutes: 660, isConflictException: false, desc: 'Wield the magic of data. Craft predictive models, analyze hidden patterns, and divine insights from the vast sea of information in this data science championship.' },
    { eventId: 'yggdrasil', norse: 'Yggdrasil', common: 'Web Design',           rune: 'ᚺ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/yggdrasil.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '09:00', endTime: '11:00', startMinutes: 540, endMinutes: 660, isConflictException: false, desc: 'Build the digital world tree. Design stunning, functional websites that branch across the web, connecting realms of creativity and technical precision.' },
    { eventId: 'mimir',     norse: 'Mimir',     common: 'Shark Tank',           rune: 'ᚾ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 2, maxMembers: 4, imagePath: 'Assets/mimir.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '10:00', endTime: '12:00', startMinutes: 600, endMinutes: 720, isConflictException: true, desc: 'Pitch your innovation to the council of wisdom. Present your startup idea, defend your vision, and convince the judges that your concept deserves to be forged into reality.' },
    { eventId: 'jotunn',    norse: 'Jotunn',    common: 'Robo War',             rune: 'ᛁ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/jotunn.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '13:00', endTime: '15:00', startMinutes: 780, endMinutes: 900, isConflictException: false, desc: 'Unleash your mechanical giant. Engineer battle robots and send them into the arena for the ultimate test of design, durability, and tactical warfare.' },
    { eventId: 'sleipnir',  norse: 'Sleipnir',  common: 'Robo Race / LFR',     rune: 'ᛃ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/sleipnir.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '13:00', endTime: '15:00', startMinutes: 780, endMinutes: 900, isConflictException: false, desc: 'Build the eight-legged steed of innovation. Design line-following robots that race with precision and speed through the course. Engineering speed meets perfection.' },
    { eventId: 'loki',      norse: 'Loki',      common: 'Crime Investigation',  rune: 'ᛈ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 2, maxMembers: 4, imagePath: 'Assets/loki.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '15:00', endTime: '17:00', startMinutes: 900, endMinutes: 1020, isConflictException: false, desc: 'The trickster has struck — can you unveil the truth? Analyze evidence, question suspects, and piece together clues in this thrilling mystery-solving challenge.' },
    { eventId: 'skald',     norse: 'Skald',     common: 'Cinematography',       rune: 'ᛉ', arenaName: 'Ragnarök', arena: 'ragnarok', eventDate: '23 April 2026', day: 2, dateLabel: '23 April', minMembers: 1, maxMembers: 2, imagePath: 'Assets/skald.png', isOfflineOnly: false, hasRegistration: true, hasRulebook: true, startTime: '15:00', endTime: '16:30', startMinutes: 900, endMinutes: 990, isConflictException: false, desc: 'Tell the tale through moving images. Craft compelling short films and visual narratives that capture the spirit of innovation, technology, and human creativity.' },
    // === BOTH DAYS ===
    { eventId: 'folkvangr', norse: 'Folkvangr', common: 'Fun Games',            rune: 'ᛊ', arenaName: 'Folkvangr', arena: 'folkvangr', eventDate: '22 & 23 April 2026', day: 0, dateLabel: '22 & 23 April', minMembers: 1, maxMembers: 1, imagePath: 'Assets/folkvangr.png', isOfflineOnly: true, hasRegistration: false, hasRulebook: false, startTime: null, endTime: null, startMinutes: 0, endMinutes: 0, isConflictException: true, desc: 'Enter the field of the people — where joy and camaraderie reign. Games include: Arm Wrestling, Musical Chairs, Tug of War, Sack Race, and many more. Offline registrations on spot.' }
];

const EXCEPTION_EVENT_IDS = ['helheim', 'mimir', 'folkvangr'];

function getEventById(id) {
    return EVENTS_DATA.find(e => e.eventId === id) || null;
}

function eventsOverlap(a, b) {
    if (!a || !b || a.eventId === b.eventId) return false;
    if (a.day !== b.day || a.day === 0 || b.day === 0) return false;
    if (!a.startMinutes || !b.startMinutes) return false;
    return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

function getConflictingEventIds(eventId) {
    const ev = getEventById(eventId);
    if (!ev || EXCEPTION_EVENT_IDS.includes(eventId)) return [];
    return EVENTS_DATA
        .filter(o => o.eventId !== eventId && !EXCEPTION_EVENT_IDS.includes(o.eventId) && eventsOverlap(ev, o))
        .map(o => o.eventId);
}

function buildConflictMap() {
    const map = {};
    EVENTS_DATA.forEach(ev => { map[ev.eventId] = getConflictingEventIds(ev.eventId); });
    return map;
}
