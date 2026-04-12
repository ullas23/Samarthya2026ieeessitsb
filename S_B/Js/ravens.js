/* =============================================
   RAVEN FLOCK ANIMATION — Environmental Effect
   Norse-themed atmospheric flying ravens
   Js/ravens.js
   ============================================= */

(function () {
    'use strict';

    const isMobile = window.innerWidth < 768;

    // =============================================
    // CONFIG
    // =============================================
    const CONFIG = {
        normalFlockSize: isMobile ? [3, 4] : [4, 6],   // [min, max] ravens per flock
        panicFlockSize: isMobile ? [3, 4] : [5, 7],
        normalDuration: [8, 14],                         // seconds
        panicDuration: [4, 6],                           // seconds (faster in panic)
        spawnInterval: [60000, 90000],                   // ms between flocks
        maxDelay: 1.5,                                   // max stagger delay in seconds
        ravenAsset: 'Assets/raven.svg'
    };

    // Flight path options for normal spawns
    const FLIGHT_PATHS = ['flyLeftToRight', 'flyRightToLeft', 'flyDiagonalUp'];

    // =============================================
    // ENSURE ENVIRONMENT LAYER EXISTS
    // =============================================
    let envLayer = document.getElementById('environment-layer');
    if (!envLayer) {
        envLayer = document.createElement('div');
        envLayer.id = 'environment-layer';
        document.body.appendChild(envLayer);
    }

    // =============================================
    // UTILITY
    // =============================================
    function randBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
        return Math.floor(randBetween(min, max + 1));
    }

    // =============================================
    // SPAWN A SINGLE RAVEN
    // =============================================
    function createRaven(options) {
        const { flightAnimation, duration, delay, startY, opacity, panicVars } = options;

        const raven = document.createElement('img');
        raven.src = CONFIG.ravenAsset;
        raven.alt = '';
        raven.className = 'raven';
        raven.setAttribute('aria-hidden', 'true');

        // Set CSS custom properties for the animation
        raven.style.setProperty('--start-y', startY + 'px');
        raven.style.setProperty('--raven-opacity', opacity.toString());

        // If panic mode, set scatter variables
        if (panicVars) {
            raven.style.setProperty('--panic-start-x', panicVars.startX);
            raven.style.setProperty('--panic-start-y', panicVars.startY);
            raven.style.setProperty('--panic-end-x', panicVars.endX);
            raven.style.setProperty('--panic-end-y', panicVars.endY);
        }

        // Apply flight animation (overrides the flap for position/movement)
        // We use two animations: flap for wing + flight for movement
        raven.style.animation = `flap 0.35s infinite alternate ease-in-out, ${flightAnimation} ${duration}s ${delay}s ease-in-out forwards`;

        envLayer.appendChild(raven);

        // Clean up after animation finishes
        const removalTime = (duration + delay + 0.5) * 1000;
        setTimeout(() => {
            if (raven.parentNode) {
                raven.parentNode.removeChild(raven);
            }
        }, removalTime);

        return raven;
    }

    // =============================================
    // SPAWN RAVEN FLOCK
    // =============================================
    function spawnRavenFlock(mode) {
        const isPanic = mode === 'panic';
        const [minCount, maxCount] = isPanic ? CONFIG.panicFlockSize : CONFIG.normalFlockSize;
        const count = randInt(minCount, maxCount);
        const [minDur, maxDur] = isPanic ? CONFIG.panicDuration : CONFIG.normalDuration;

        if (isPanic) {
            // Panic mode: ravens scatter outward from center
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + randBetween(-0.4, 0.4);
                const scatterDist = randBetween(600, 1200);
                const startOffset = randBetween(0, 80);

                const startX = centerX + Math.cos(angle) * startOffset - 20;
                const startY = centerY + Math.sin(angle) * startOffset - 15;
                const endX = centerX + Math.cos(angle) * scatterDist - 20;
                const endY = centerY + Math.sin(angle) * scatterDist - 15;

                const duration = randBetween(minDur, maxDur);
                const delay = randBetween(0, 0.3); // Very short delay for panic

                createRaven({
                    flightAnimation: 'panicScatter',
                    duration,
                    delay,
                    startY: 0,
                    opacity: randBetween(0.8, 1),
                    panicVars: {
                        startX: startX + 'px',
                        startY: startY + 'px',
                        endX: endX + 'px',
                        endY: endY + 'px'
                    }
                });
            }
        } else {
            // Normal mode: pick a random flight path for the whole flock
            const flightAnimation = FLIGHT_PATHS[randInt(0, FLIGHT_PATHS.length - 1)];

            for (let i = 0; i < count; i++) {
                const duration = randBetween(minDur, maxDur);
                const delay = randBetween(0, CONFIG.maxDelay);
                // Each raven at a slightly different vertical position
                const startY = randBetween(
                    window.innerHeight * 0.1,
                    window.innerHeight * 0.5
                );
                const opacity = randBetween(0.7, 0.95);

                createRaven({
                    flightAnimation,
                    duration,
                    delay,
                    startY,
                    opacity,
                    panicVars: null
                });
            }
        }
    }

    // =============================================
    // RANDOM SPAWN LOOP
    // =============================================
    let schedulerTimeout = null;

    function scheduleRavens() {
        const interval = randBetween(CONFIG.spawnInterval[0], CONFIG.spawnInterval[1]);

        schedulerTimeout = setTimeout(() => {
            spawnRavenFlock();
            scheduleRavens(); // Reschedule next flock
        }, interval);
    }

    // =============================================
    // SONIC BOOM HOOK — exposed globally
    // =============================================
    window.triggerRavenPanic = function () {
        spawnRavenFlock('panic');
    };

    // Also expose the normal spawn for testing
    window.spawnRavenFlock = spawnRavenFlock;

    // =============================================
    // INITIALIZATION
    // Wait for loader to finish before starting the flock schedule
    // We listen for the loader removal as a signal
    // =============================================
    function init() {
        // Start the random schedule loop
        scheduleRavens();
    }

    // Wait for the page to be ready and loader to finish
    // The loader takes ~5 seconds, so we start the raven schedule after that
    if (document.readyState === 'complete') {
        setTimeout(init, 6000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(init, 6000);
        });
    }

})();
