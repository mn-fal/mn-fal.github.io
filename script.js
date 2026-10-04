/**
 * Fal Portfolio — Interactive Scripts
 * Splash screen, scroll reveals, mobile menu, progress bars, scroll-to-top
 */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Splash Screen ----
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
        }, 1800);
        // Remove from DOM after transition
        splash.addEventListener('transitionend', () => {
            splash.remove();
        });
    }

    // ---- Mobile Menu Toggle ----
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;
    let menuCloseTimer;

    if (menuBtn && mobileMenu) {
        const closeMobileMenu = () => {
            if (!menuOpen) return;

            menuOpen = false;
            menuBtn.classList.remove('is-open');
            menuBtn.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('mobile-menu-enter');
            mobileMenu.classList.add('mobile-menu-exit');

            clearTimeout(menuCloseTimer);
            menuCloseTimer = setTimeout(() => {
                if (!menuOpen) mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('mobile-menu-exit');
            }, 180);
        };

        menuBtn.addEventListener('click', () => {
            if (menuOpen) {
                closeMobileMenu();
                return;
            }

            clearTimeout(menuCloseTimer);
            menuOpen = true;
            mobileMenu.classList.remove('hidden', 'mobile-menu-exit', 'mobile-menu-enter');
            menuBtn.classList.toggle('is-open', menuOpen);
            menuBtn.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(() => mobileMenu.classList.add('mobile-menu-enter'));
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    }

    // ---- Scroll Reveal (IntersectionObserver) ----
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const fadeInElements = document.querySelectorAll('.fade-in-up');
    const skillCards = document.querySelectorAll('.skill-card-stagger');
    const stepCards = document.querySelectorAll('.step-card');
    const diseaseCards = document.querySelectorAll('.disease-card');

    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    };

    // The hero uses CSS keyframe animations rather than the .revealed class.
    // Remove the class out of view so the animation can replay on re-entry.
    const fadeInOutsideViewport = new WeakSet();
    const fadeInObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (fadeInOutsideViewport.has(entry.target)) {
                    entry.target.classList.add('fade-in-up');
                    fadeInOutsideViewport.delete(entry.target);
                }
            } else {
                entry.target.classList.remove('fade-in-up');
                fadeInOutsideViewport.add(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeInElements.forEach(element => fadeInObserver.observe(element));

    function observeReplay(elements, options, getDelay = () => 0) {
        const pendingTimers = new WeakMap();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const element = entry.target;
                clearTimeout(pendingTimers.get(element));

                if (entry.isIntersecting) {
                    const timer = setTimeout(() => {
                        element.classList.add('revealed');
                        pendingTimers.delete(element);
                    }, getDelay(element));
                    pendingTimers.set(element, timer);
                } else {
                    element.classList.remove('revealed');
                }
            });
        }, options);

        elements.forEach(element => observer.observe(element));
        return observer;
    }

    // Replay reveal transitions whenever elements re-enter the viewport.
    observeReplay(revealElements, revealObserverOptions);

    // Staggered reveals replay on every visit to the viewport.
    observeReplay(skillCards, { threshold: 0.1 }, card =>
        parseFloat(card.style.animationDelay || '0') * 1000
    );

    observeReplay(stepCards, { threshold: 0.1 }, card => {
        const step = parseInt(card.dataset.step || '1', 10);
        return (step - 1) * 200;
    });

    observeReplay(diseaseCards, { threshold: 0.1 }, card =>
        Array.from(diseaseCards).indexOf(card) * 120
    );

    // ---- Progress Bars + Counters Animation ----
    const progressBars = document.querySelectorAll('.progress-bar');
    const counters = document.querySelectorAll('.counter');

    const progressTimers = new WeakMap();
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const bar = entry.target;
            clearTimeout(progressTimers.get(bar));

            if (entry.isIntersecting) {
                const targetWidth = bar.dataset.width;
                // Trigger the CSS transition
                const timer = setTimeout(() => {
                    bar.style.width = targetWidth + '%';
                    progressTimers.delete(bar);
                }, 300);
                progressTimers.set(bar, timer);
            } else {
                bar.style.width = '0%';
            }
        });
    }, { threshold: 0.3 });

    progressBars.forEach(bar => progressObserver.observe(bar));

    const counterTimers = new WeakMap();
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const counter = entry.target;
            clearInterval(counterTimers.get(counter));
            counterTimers.delete(counter);

            if (entry.isIntersecting) {
                const target = parseInt(counter.dataset.target);
                animateCounter(counter, target);
            } else {
                counter.textContent = '0%';
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(c => counterObserver.observe(c));

    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 60;
        const duration = 1500;
        const stepTime = duration / 60;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                counterTimers.delete(element);
            }
            element.textContent = Math.round(current) + '%';
        }, stepTime);
        counterTimers.set(element, timer);
    }

    // ---- Scroll-to-Top Button ----
    const scrollTopBtn = document.getElementById('scroll-top-btn');

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---- Active Nav Highlighting ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // ---- Smooth scroll polyfill for nav links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- Parallax dot pattern (subtle) ----
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                document.body.style.backgroundPosition =
                    `0 ${scrolled * 0.03}px, 16px ${16 + scrolled * 0.03}px`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

});