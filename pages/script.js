/* Local fallback only when native carousel init fails. */
(function() {
    function parseTranslatePercent(el) {
        if (!el) return 100;
        const raw =
            (el.getAttribute("style") || "") + " " + (el.style.transform || "");
        const m = raw.match(/translateX\((-?\d+(\.\d+)?)%\)/i);
        return m ? Math.abs(Number(m[1])) : 100;
    }

    function getCarouselRoots() {
        return Array.from(document.querySelectorAll(".mfr-carousel")).filter(
            function(root) {
                return root.querySelector(".mfr-carousel__item");
            },
        );
    }

    function nativeCarouselActive(root) {
        try {
            return !!(
                window.Flickity &&
                window.Flickity.data &&
                window.Flickity.data(root)
            );
        } catch (e) {
            return false;
        }
    }

    function bindFallback(root) {
        if (root.dataset.localSliderBound === "1") return;
        root.dataset.localSliderBound = "1";

        var track = root.querySelector(".flickity-slider");
        var slides = Array.from(
            (track || root).querySelectorAll(":scope > .mfr-carousel__item"),
        );
        if (!slides.length && track)
            slides = Array.from(track.querySelectorAll(".mfr-carousel__item"));
        if (!slides.length) return;

        if (!track) track = root;
        track.style.transition =
            track.style.transition || "transform 360ms ease-in-out";

        var step = slides.length > 1 ? parseTranslatePercent(slides[1]) : 100;
        var current = Math.max(
            0,
            slides.findIndex(function(s) {
                return s.classList.contains("is-selected");
            }),
        );
        if (current < 0) current = 0;

        var prevButtons = Array.from(
            root.querySelectorAll(
                ".flickity-prev-next-button.previous, .flickity-button.previous",
            ),
        );
        var nextButtons = Array.from(
            root.querySelectorAll(
                ".flickity-prev-next-button.next, .flickity-button.next",
            ),
        );

        function render() {
            track.style.transform = "translateX(-" + current * step + "%)";
            slides.forEach(function(slide, idx) {
                slide.classList.toggle("is-selected", idx === current);
                if (idx === current) slide.removeAttribute("aria-hidden");
                else slide.setAttribute("aria-hidden", "true");
            });
            prevButtons.forEach(function(b) {
                b.disabled = current <= 0;
            });
            nextButtons.forEach(function(b) {
                b.disabled = current >= slides.length - 1;
            });
        }

        prevButtons.forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                if (nativeCarouselActive(root)) return;
                e.preventDefault();
                current = Math.max(0, current - 1);
                render();
            });
        });

        nextButtons.forEach(function(btn) {
            btn.addEventListener("click", function(e) {
                if (nativeCarouselActive(root)) return;
                e.preventDefault();
                current = Math.min(slides.length - 1, current + 1);
                render();
            });
        });

        render();
    }

    function initFallbacks() {
        getCarouselRoots().forEach(function(root) {
            if (!nativeCarouselActive(root)) bindFallback(root);
        });
    }

    window.addEventListener("load", function() {
        initFallbacks();
        window.setTimeout(initFallbacks, 900);
    });
})();

(function() {
    var heroImages = [
        "/assest/Gemini_Generated_Image_fe64r9fe64r9fe64.png",
        "/assest/Gemini_Generated_Image_u2c95pu2c95pu2c9.png",
        "/assest/Gemini_Generated_Image_4raaxx4raaxx4raa.png",
        "/assest/Gemini_Generated_Image_w15sszw15sszw15s.png"
    ];
    var heroSelector = "#template--19564690964540__mfr_core_hero_banner_jRfmBn .hero-section__slide-background";
    var intervalMs = 5000;
    var currentIndex = 0;
    var intervalId = null;

    function setHeroBackground(index) {
        var heroes = document.querySelectorAll(heroSelector);
        console.log("[Hero Rotation] Found " + heroes.length + " hero elements");
        if (!heroes.length) return false;

        heroes.forEach(function(hero, i) {
            hero.style.backgroundImage = 'url("' + heroImages[index] + '")';
            
            console.log("[Hero Rotation] Set background " + i + " to: " + heroImages[index]);
        });

        return true;
    }

    function startHeroRotation() {
        if (!heroImages.length) return;
        console.log("[Hero Rotation] Attempting to start rotation...");

        if (!setHeroBackground(currentIndex)) {
            console.log("[Hero Rotation] Could not find hero elements yet");
            return false;
        }

        if (intervalId) return true;

        console.log("[Hero Rotation] Started! Rotating every " + intervalMs + "ms");
        intervalId = setInterval(function() {
            currentIndex = (currentIndex + 1) % heroImages.length;
            setHeroBackground(currentIndex);
        }, intervalMs);

        return true;
    }

    function waitForHero() {
        console.log("[Hero Rotation] Window load event fired");
        if (startHeroRotation()) {
            console.log("[Hero Rotation] Successfully started immediately");
            return;
        }

        console.log("[Hero Rotation] Waiting for DOM changes...");
        var observer = new MutationObserver(function() {
            if (startHeroRotation()) {
                console.log("[Hero Rotation] Found hero elements after DOM change");
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    window.addEventListener("load", function() {
        // Add delay to ensure DOM is fully settled
        setTimeout(waitForHero, 100);
    });
    
    if (document.readyState === "complete") {
        console.log("[Hero Rotation] Document already loaded, running immediately");
        setTimeout(waitForHero, 100);
    }
})();