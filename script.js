/**
 * Fal Portfolio — Interactive Scripts
 * Splash screen, scroll reveals, mobile menu, progress bars, scroll-to-top
 */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Splash Screen ----
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            document.body.classList.add('intro-started');
            splash.classList.add('hidden');
        }, 1800);
        splash.addEventListener('transitionend', event => {
            if (event.propertyName === 'opacity') splash.remove();
        });
    } else {
        document.body.classList.add('intro-started');
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
    const skillCards = document.querySelectorAll('.skill-card-stagger');
    const stepCards = document.querySelectorAll('.step-card');
    const diseaseCards = document.querySelectorAll('.disease-card');

    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    };

    function observeOnce(elements, options, getDelay = () => 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    observer.unobserve(element);
                    setTimeout(() => element.classList.add('revealed'), getDelay(element));
                }
            });
        }, options);

        elements.forEach(element => observer.observe(element));
    }

    // Reveal elements once so scrolling away never hides their content again.
    observeOnce(revealElements, revealObserverOptions);

    // Keep the staggered entrance while avoiding repeated fades on scroll.
    observeOnce(skillCards, { threshold: 0.1 }, card =>
        parseFloat(card.style.animationDelay || '0') * 1000
    );

    observeOnce(stepCards, { threshold: 0.1 }, card => {
        const step = parseInt(card.dataset.step || '1', 10);
        return (step - 1) * 200;
    });

    observeOnce(diseaseCards, { threshold: 0.1 }, card =>
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
