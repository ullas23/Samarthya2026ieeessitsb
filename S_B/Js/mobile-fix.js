/* =============================================
   MOBILE PERFORMANCE & STABILITY PATCH
   Js/mobile-fix.js
   =============================================
   Runs ONLY on mobile devices.
   Desktop/tablet behavior is fully preserved.
   ============================================= */

(function () {
    'use strict';

    const isMobile = window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) return; // Exit immediately on non-mobile — zero impact

    // =============================================
    // 1. DEBOUNCE RESIZE HANDLERS
    //    Prevent expensive resize recalcs on mobile
    // =============================================
    let resizeTimeout = null;
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    // Debounced resize wrapper
    function debouncedResize(callback, delay) {
        return function () {
            const args = arguments;
            const context = this;
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => callback.apply(context, args), delay || 150);
        };
    }

    // =============================================
    // 2. STABILIZE HERO SECTION ON LOAD
    //    Prevent layout shift / auto-scroll feeling
    // =============================================
    function stabilizeHero() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        // Set explicit height on hero to prevent reflow
        const setHeroHeight = () => {
            const vh = window.innerHeight;
            hero.style.minHeight = vh + 'px';
        };

        setHeroHeight();

        // Only update on debounced resize (orientation change, etc.)
        window.addEventListener('resize', debouncedResize(setHeroHeight, 250));

        // Force scroll to top after loader completes
        // This prevents the "auto-shift downward" feeling
        const loaderCheckInterval = setInterval(() => {
            const loader = document.getElementById('forge-loader');
            if (!loader || loader.classList.contains('fade-out')) {
                clearInterval(loaderCheckInterval);
                // Stabilize position after loader removal
                requestAnimationFrame(() => {
                    if (window.scrollY < 10) {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                });
            }
        }, 100);

        // Safety timeout — clear interval after 8s
        setTimeout(() => clearInterval(loaderCheckInterval), 8000);
    }

    // =============================================
    // 3. OPTIMIZE CANVAS SIZING
    //    Canvases must fit viewport exactly
    // =============================================
    function fixCanvasSizing() {
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            // Ensure no canvas exceeds viewport width
            const style = window.getComputedStyle(canvas);
            if (canvas.id === 'particle-canvas') {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                canvas.style.width = '100vw';
                canvas.style.maxWidth = '100vw';
            }
            if (canvas.id === 'hero-canvas') {
                canvas.style.width = '100%';
                canvas.style.maxWidth = '100vw';
            }
            if (canvas.id === 'events-canvas') {
                canvas.style.width = '100%';
                canvas.style.maxWidth = '100vw';
            }
            if (canvas.id === 'lightning-canvas') {
                canvas.style.maxWidth = '100vw';
            }
        });
    }

    // =============================================
    // 4. REDUCE FLOATING RUNE OVERFLOW RISK
    //    Clamp rune positions to safe viewport area
    // =============================================
    function fixFloatingRunes() {
        const runes = document.querySelectorAll('.rune-float');
        runes.forEach(rune => {
            // Ensure runes don't extend past right edge
            const leftVal = parseFloat(rune.style.left);
            if (leftVal > 90) {
                rune.style.left = (Math.random() * 80) + 'vw';
            }
            // Constrain font size on mobile
            const fontSize = parseFloat(rune.style.fontSize);
            if (fontSize > 35) {
                rune.style.fontSize = '25px';
            }
        });
    }

    // =============================================
    // 5. OPTIMIZE SCROLL PERFORMANCE
    //    Use passive scroll listeners
    // =============================================
    function optimizeScrollListeners() {
        // The navbar scroll handler — optimize with RAF
        let scrollTicking = false;
        const nav = document.getElementById('navbar');

        if (nav) {
            // Remove inline scroll listener and replace with optimized one
            window.addEventListener('scroll', () => {
                if (!scrollTicking) {
                    requestAnimationFrame(() => {
                        nav.classList.toggle('scrolled', window.scrollY > 50);
                        scrollTicking = false;
                    });
                    scrollTicking = true;
                }
            }, { passive: true });
        }
    }

    // =============================================
    // 6. REDUCE GPU STRESS FROM LARGE BOX-SHADOWS
    //    Simplify shadows that are identical visually
    //    on small screens
    // =============================================
    function reduceGPUStress() {
        // Reduce box-shadow complexity on elements with heavy shadows
        const heavyShadowElements = document.querySelectorAll(
            '.saga-frame, .stone-slab, .event-card, .rune-circle'
        );
        // We don't change these visually — just add will-change hints
        // for elements that animate, so the GPU composites them
        heavyShadowElements.forEach(el => {
            el.style.willChange = 'auto'; // Prevent unnecessary compositing
        });

        // For elements that DO animate, promote sensibly
        const animatedElements = document.querySelectorAll(
            '.nordic-divider-shimmer, .saga-shimmer, .scroll-line'
        );
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
            el.style.contain = 'layout';
        });
    }

    // =============================================
    // 7. FIX OVERFLOW FROM ABSOLUTE/FIXED LAYERS
    //    Audit & clip decorative layers
    // =============================================
    function fixDecorativeLayers() {
        // #societies::before creates a 600x600px circle — clamp it
        const societiesSection = document.getElementById('societies');
        if (societiesSection) {
            societiesSection.style.overflow = 'hidden';
        }

        // #reach-realm::before creates a 700x700px circle
        const reachRealm = document.getElementById('reach-realm');
        if (reachRealm) {
            reachRealm.style.overflow = 'hidden';
        }

        // #hall-of-sagas::before creates 800x800px circle
        const hallOfSagas = document.getElementById('hall-of-sagas');
        if (hallOfSagas) {
            hallOfSagas.style.overflow = 'hidden';
        }
    }

    // =============================================
    // 8. PREVENT CURSOR ELEMENT OVERLAP ON MOBILE
    //    Custom cursor is hidden via CSS, but ensure
    //    JS doesn't track mouse unnecessarily
    // =============================================
    function disableCursorTracking() {
        const cursor = document.getElementById('cursor');
        const cursorDot = document.getElementById('cursor-dot');
        if (cursor) cursor.style.display = 'none';
        if (cursorDot) cursorDot.style.display = 'none';
    }

    // =============================================
    // 9. STABILIZE LOADER → HERO TRANSITION
    // =============================================
    function stabilizeLoaderTransition() {
        // Ensure body doesn't scroll during loader
        const loader = document.getElementById('forge-loader');
        if (loader) {
            document.body.style.overflow = 'hidden';

            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (loader.classList.contains('fade-out')) {
                            // Delay restoring scroll until hero is revealed
                            setTimeout(() => {
                                document.body.style.overflow = '';
                                // Ensure we're at top
                                window.scrollTo(0, 0);
                            }, 1000);
                            observer.disconnect();
                        }
                    }
                });
            });

            observer.observe(loader, { attributes: true });

            // Safety: if loader is already gone
            setTimeout(() => {
                if (!document.getElementById('forge-loader')) {
                    document.body.style.overflow = '';
                }
                observer.disconnect();
            }, 7000);
        }
    }

    // =============================================
    // INIT — Run all mobile fixes
    // =============================================
    function init() {
        stabilizeHero();
        fixCanvasSizing();
        disableCursorTracking();
        reduceGPUStress();
        fixDecorativeLayers();
        stabilizeLoaderTransition();

        // Defer non-critical fixes
        requestAnimationFrame(() => {
            fixFloatingRunes();
            optimizeScrollListeners();
        });

        // Fix canvas sizing on resize (debounced)
        window.addEventListener('resize', debouncedResize(() => {
            fixCanvasSizing();
            fixFloatingRunes();
        }, 200));
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
