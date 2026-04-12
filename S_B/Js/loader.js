/* =============================================
   FORGE LOADER — Norse Mythology Cinematic Loader
   Js/loader.js
   ============================================= */

(function () {
    'use strict';

    const loader = document.getElementById('forge-loader');
    if (!loader) return;

    const isMobile = window.innerWidth < 768;

    // =============================================
    // 1. LIGHTNING CANVAS
    // =============================================
    const lightningCanvas = document.getElementById('lightning-canvas');
    const lCtx = lightningCanvas.getContext('2d');

    function resizeLightningCanvas() {
        lightningCanvas.width = window.innerWidth;
        lightningCanvas.height = window.innerHeight;
    }
    resizeLightningCanvas();
    window.addEventListener('resize', resizeLightningCanvas);

    let lightningBolts = [];
    let lightningIntensity = 1;

    function createBolt() {
        const startX = Math.random() * lightningCanvas.width;
        const startY = 0;
        const segments = [];
        let x = startX;
        let y = startY;

        const endY = lightningCanvas.height * (0.4 + Math.random() * 0.6);
        const steps = 10 + Math.floor(Math.random() * 6);

        for (let i = 0; i < steps; i++) {
            const nx = x + (Math.random() - 0.5) * 100;
            const ny = y + (endY - startY) / steps;
            segments.push({ x1: x, y1: y, x2: nx, y2: ny });

            // Branching — less frequent, more cinematic
            if (Math.random() < 0.2 && i > 2) {
                const bx = nx + (Math.random() - 0.5) * 70;
                const by = ny + (endY - startY) / steps * 0.5;
                segments.push({ x1: nx, y1: ny, x2: bx, y2: by, branch: true });
            }

            x = nx;
            y = ny;
        }

        lightningBolts.push({
            segments,
            alpha: 0.3 + Math.random() * 0.3,
            life: 1,
            decay: 0.025 + Math.random() * 0.025
        });
    }

    let lastLightningTime = 0;
    // Reduced frequency — more dramatic pauses between strikes
    let lightningInterval = 500 + Math.random() * 600;

    function drawLightning(timestamp) {
        lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);

        // Spawn new bolts
        if (timestamp - lastLightningTime > lightningInterval / lightningIntensity) {
            createBolt();
            lastLightningTime = timestamp;
            lightningInterval = 500 + Math.random() * 600;
        }

        // Draw and decay bolts
        lightningBolts = lightningBolts.filter(bolt => {
            bolt.life -= bolt.decay;
            if (bolt.life <= 0) return false;

            bolt.segments.forEach(seg => {
                lCtx.beginPath();
                lCtx.moveTo(seg.x1, seg.y1);
                lCtx.lineTo(seg.x2, seg.y2);
                lCtx.strokeStyle = `rgba(0, 234, 255, ${bolt.life * bolt.alpha})`;
                // Thicker lightning bolts — more cinematic
                lCtx.lineWidth = seg.branch ? 1.5 : 3;
                lCtx.shadowBlur = 20;
                lCtx.shadowColor = `rgba(0, 234, 255, ${bolt.life * 0.6})`;
                lCtx.stroke();
            });

            lCtx.shadowBlur = 0;
            return true;
        });
    }

    // =============================================
    // 2. ORBITING RUNES — positioned in a circle
    //    Now inside hammer-container
    // =============================================
    const hammerContainer = loader.querySelector('.hammer-container');
    const runeRing = hammerContainer.querySelector('.rune-ring');
    const runeChars = ['ᚠ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

    // Radius matches the rune-ring CSS size / 2
    const ringRadius = isMobile ? (window.innerWidth < 480 ? 110 : 135) : 170;

    runeChars.forEach((char, i) => {
        const angle = (i / runeChars.length) * Math.PI * 2;
        const rune = document.createElement('span');
        rune.className = 'rune';
        rune.textContent = char;

        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        rune.style.transform = `translate(${x}px, ${y}px)`;
        rune.style.animationDelay = `${(i / runeChars.length) * 2.5}s`;

        runeRing.appendChild(rune);
    });

    // =============================================
    // 3. MAIN ANIMATION LOOP
    // =============================================
    let animationActive = true;

    function mainLoop(timestamp) {
        if (!animationActive) return;
        drawLightning(timestamp);
        requestAnimationFrame(mainLoop);
    }
    requestAnimationFrame(mainLoop);

    // =============================================
    // 4. HAMMER STRIKE TIMELINE
    //    All effects now inside hammer-container
    // =============================================
    const hammer = hammerContainer.querySelector('.mjolnir');
    const flashScreen = loader.querySelector('.flash-screen');
    const mistContainer = loader.querySelector('.golden-mist-container');
    const shockwaveRings = hammerContainer.querySelectorAll('.shockwave-ring');

    // 0.8s — Lightning intensifies
    setTimeout(() => {
        lightningIntensity = 2;
    }, 800);

    // 1.5s — Lightning intensifies further
    setTimeout(() => {
        lightningIntensity = 3;
    }, 1500);

    // 2.0s — SONIC STRIKE: synchronized hammer dip + core flash + shockwave
    setTimeout(() => {
        // Hammer strike rotation
        if (hammer) {
            hammer.classList.add('striking');
            hammer.style.filter = 'drop-shadow(0 0 60px rgba(0,234,255,0.9)) drop-shadow(0 0 120px rgba(0,234,255,0.5))';
        }

        // Camera shake
        loader.classList.add('shake');


        // Shockwave rings — staggered
        shockwaveRings.forEach((ring, i) => {
            setTimeout(() => {
                ring.classList.add('active');
            }, i * 100);
        });

        // Massive lightning burst
        lightningIntensity = 8;
        for (let i = 0; i < 5; i++) {
            createBolt();
        }



    }, 2000);

    // 2.05s — Cyan flash
    setTimeout(() => {
        if (flashScreen) {
            flashScreen.classList.add('active');
        }
        lightningIntensity = 0.3;
    }, 2050);

    // 2.3s — Golden mist appears
    setTimeout(() => {
        spawnGoldenMist();


        // Fade out hammer effects
        if (runeRing) {
            runeRing.style.transition = 'opacity 0.5s';
            runeRing.style.opacity = '0';
        }
        if (hammer) {
            hammer.style.transition = 'opacity 0.8s, filter 0.8s';
            hammer.style.opacity = '0';
            hammer.style.filter = 'drop-shadow(0 0 80px rgba(207,167,74,0.9)) brightness(2)';
        }
        // Fade the container float
        if (hammerContainer) {
            hammerContainer.style.transition = 'opacity 0.8s';
            hammerContainer.style.opacity = '0';
        }
    }, 2300);

    // 4.5s — Begin loader fade out
    setTimeout(() => {
        animationActive = false;
        loader.classList.add('fade-out');
    }, 4500);

    // 5.0s — Reveal hero, remove loader
    setTimeout(() => {
        const hero = document.getElementById('hero');
        if (hero) {
            hero.classList.add('revealed');
        }

        // Start hero text animations if the function exists
        if (typeof startHeroAnimations === 'function') {
            startHeroAnimations();
        }

        // Remove loader from DOM
        setTimeout(() => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 900);
    }, 5000);

    // =============================================
    // 5. GOLDEN MIST PARTICLES
    // =============================================
    function spawnGoldenMist() {
        if (!mistContainer) return;

        const colors = ['#cfa74a', '#e6c87c', '#f2d99b'];
        const count = isMobile ? 40 : 80;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'golden-particle';

            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 2 + Math.random() * 5;
            const x = Math.random() * 100;
            const y = 40 + Math.random() * 50;
            const delay = Math.random() * 1.2;

            particle.style.cssText = `
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
                animation-delay: ${delay}s;
            `;

            particle.style.animationName = 'goldenFloat';
            particle.style.animationDuration = (2 + Math.random() * 1) + 's';
            particle.style.animationTimingFunction = 'ease-out';
            particle.style.animationFillMode = 'forwards';

            mistContainer.appendChild(particle);
        }
    }

})();
