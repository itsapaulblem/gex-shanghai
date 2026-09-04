const printButton = document.querySelector('#print-guide');

printButton?.addEventListener('click', () => window.print());

const navigationLinks = [...document.querySelectorAll('.side-nav a')];
const sections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

    if (!visible) return;

    navigationLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  },
  { rootMargin: '-10% 0px -65% 0px', threshold: [0, 0.2, 0.5] },
);

sections.forEach((section) => observer.observe(section));
