/* =========================================================================
   MUKTSAR VISUAL — INTERACTIVE AGENCY CONTROLLER
   ========================================================================= */

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const navbar = document.getElementById('navbar');
const scrollProgressBar = document.getElementById('scrollProgressBar');
const backToTopBtn = document.getElementById('backToTopBtn');
const scrollRingCircle = document.getElementById('scrollRingCircle');
const desktopNav = document.getElementById('desktopNav');
const navPillIndicator = document.getElementById('navPillIndicator');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const campaignModal = document.getElementById('campaignModal');
const servicePills = document.querySelectorAll('.service-pill');
const RING_CIRCUMFERENCE = 2 * Math.PI * 20;

let activeNavLink = null;
let hoveredNavLink = null;

// 1. Mobile Navigation Drawer
function setMobileMenuState(open) {
  if (!mobileMenuBtn || !mobileDrawer) return;
  mobileMenuBtn.classList.toggle('is-open', open);
  mobileDrawer.classList.toggle('is-open', open);
  mobileMenuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    setMobileMenuState(!mobileDrawer.classList.contains('is-open'));
  });
}

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => setMobileMenuState(false));
});

// 2. Magnetic Pull & Sliding Pill Scroll-Spy
function positionNavPill(targetLink) {
  if (!targetLink || !desktopNav || !navPillIndicator) {
    if (navPillIndicator) navPillIndicator.style.opacity = '0';
    return;
  }
  const navRect = desktopNav.getBoundingClientRect();
  const linkRect = targetLink.getBoundingClientRect();
  navPillIndicator.style.width = `${linkRect.width}px`;
  navPillIndicator.style.transform = `translateX(${linkRect.left - navRect.left}px)`;
  navPillIndicator.style.opacity = '1';
}

navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    hoveredNavLink = link;
    positionNavPill(link);
  });
});

if (desktopNav) {
  desktopNav.addEventListener('mouseleave', () => {
    hoveredNavLink = null;
    positionNavPill(activeNavLink);
  });
}

document.querySelectorAll('.magnetic-el').forEach(el => {
  el.addEventListener('mousemove', e => {
    if (window.innerWidth < 768) return;
    const rect = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.18}px, ${(e.clientY - rect.top - rect.height / 2) * 0.22}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0px, 0px)';
  });
});

// 3. Scroll Telemetry, Shrinking Navbar & Back-to-Top Ring
const trackedSections = ['services', 'approach', 'work', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);

function updateNavigationTelemetry() {
  const scrollY = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

  if (scrollProgressBar) scrollProgressBar.style.transform = `scaleX(${progress})`;
  if (navbar) navbar.classList.toggle('is-scrolled', scrollY > 36);

  if (backToTopBtn && scrollRingCircle) {
    backToTopBtn.classList.toggle('visible', scrollY > 380);
    scrollRingCircle.style.strokeDashoffset = (RING_CIRCUMFERENCE * (1 - progress)).toFixed(2);
  }

  const spyOffset = navbar ? navbar.offsetHeight + 120 : 180;
  let currentSectionId = null;

  for (const section of trackedSections) {
    if (scrollY >= section.offsetTop - spyOffset && scrollY < section.offsetTop - spyOffset + section.offsetHeight) {
      currentSectionId = section.id;
      break;
    }
  }
  if (docHeight - scrollY < 80) currentSectionId = 'contact';

  const nextActive = currentSectionId
    ? navLinks.find(l => l.dataset.navTarget === currentSectionId) || null
    : null;

  if (nextActive !== activeNavLink) {
    if (activeNavLink) activeNavLink.classList.remove('text-offwhite');
    activeNavLink = nextActive;
    if (activeNavLink) activeNavLink.classList.add('text-offwhite');
    if (!hoveredNavLink) positionNavPill(activeNavLink);
  }
}

window.addEventListener('scroll', updateNavigationTelemetry, { passive: true });
window.addEventListener('resize', () => {
  positionNavPill(hoveredNavLink || activeNavLink);
  updateNavigationTelemetry();
});
updateNavigationTelemetry();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const targetEl = document.querySelector(href);
    if (!targetEl) return;
    e.preventDefault();
    const headerOffset = href === '#top' ? 0 : (navbar ? navbar.offsetHeight + 12 : 84);
    window.scrollTo({
      top: Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - headerOffset),
      behavior: 'smooth'
    });
  });
});

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// 4. Bento Card Spotlight & Scroll Reveal
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// 5. Interactive Service Selection & Inquiry Form
servicePills.forEach(pill => pill.addEventListener('click', () => pill.classList.toggle('active')));

function selectServiceAndScroll(serviceName) {
  servicePills.forEach(pill => {
    if (pill.dataset.service === serviceName) pill.classList.add('active');
  });
  const contactEl = document.getElementById('contact');
  if (!contactEl) return;
  const headerOffset = navbar ? navbar.offsetHeight + 12 : 84;
  window.scrollTo({
    top: contactEl.getBoundingClientRect().top + window.scrollY - headerOffset,
    behavior: 'smooth'
  });
}

function copyStudioEmail() {
  const emailEl = document.getElementById('studioEmailText');
  if (!emailEl) return;
  navigator.clipboard?.writeText(emailEl.textContent).then(() => {
    const label = document.getElementById('copyBtnLabel');
    if (label) {
      label.textContent = 'COPIED!';
      setTimeout(() => { label.textContent = 'COPY'; }, 2000);
    }
  });
}

const inquiryForm = document.getElementById('projectInquiryForm');
const inquiryConfirmation = document.getElementById('inquiryConfirmation');

if (inquiryForm && inquiryConfirmation) {
  inquiryForm.addEventListener('submit', e => {
    e.preventDefault();
    const clientName = document.getElementById('businessName').value.trim() || 'Partner';
    const activeServices = Array.from(document.querySelectorAll('.service-pill.active')).map(b => b.dataset.service);
    document.getElementById('confirmedClientName').textContent = clientName;
    document.getElementById('confirmedServicesList').textContent =
      activeServices.length ? activeServices.join(', ') : 'Full-Service Digital Growth';
    inquiryForm.classList.add('hidden');
    inquiryConfirmation.classList.remove('hidden');
  });
}

function resetInquiryForm() {
  if (!inquiryForm || !inquiryConfirmation) return;
  inquiryForm.reset();
  inquiryConfirmation.classList.add('hidden');
  inquiryForm.classList.remove('hidden');
}

// 6. Campaign Case Study Modal
const campaignData = [
  {
    tag: 'CONTENT CREATION & REELS',
    title: 'Lifestyle & Retail Brand Launch',
    summary: 'We conceptualized, shot, and edited a cohesive visual identity and 12 high-retention Instagram Reels designed to turn local shoppers into loyal brand advocates.',
    deliverables: [
      '4K Commercial Brand Film & Product Photography',
      '12 Hook-Engineered Vertical Reels with Custom Sound Design',
      'Cohesive Grid Aesthetic & Launch Rollout Calendar'
    ],
    metric: '+420% Organic Reach & 3x Profile Visits',
    serviceTarget: 'Content Creation'
  },
  {
    tag: 'PAID ADS & CAMPAIGN MANAGEMENT',
    title: 'High-Converting Meta Ad Engine',
    summary: 'End-to-end Instagram and Facebook advertising funnel combining scroll-stopping video ad creatives with precision local and interest-based audience targeting.',
    deliverables: [
      '3 High-Impact Commercial Ad Variations (A/B Tested)',
      'Full Meta Ads Manager Setup, Retargeting & Pixel Tracking',
      'Daily Budget Optimization & Lead Conversion Reporting'
    ],
    metric: '3.8x Return on Ad Spend (ROAS)',
    serviceTarget: 'Paid Ads & Campaign Management'
  },
  {
    tag: 'CREATOR MANAGEMENT & PROMOTION',
    title: 'Creator Network Brand Surge',
    summary: 'We sourced, negotiated with, and directed 18 regional content creators to deliver authentic, high-trust storytelling across Instagram and YouTube Shorts.',
    deliverables: [
      'Creator Scouting, Vetting & Contract Management',
      'Creative Briefs & Brand-Aligned Talking Points',
      'Cross-Channel Amplification & Engagement Tracking'
    ],
    metric: '18+ Creators • 650K+ Verified Local Views',
    serviceTarget: 'Creator Management'
  }
];

function openCampaignModal(index) {
  const data = campaignData[index];
  if (!data || !campaignModal) return;
  document.getElementById('modalTag').textContent = data.tag;
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalSummary').textContent = data.summary;
  document.getElementById('modalMetric').textContent = data.metric;
  document.getElementById('modalDeliverables').innerHTML = data.deliverables
    .map(item => `<li class="flex items-start gap-2.5"><span class="text-amberAccent mt-0.5">✦</span><span>${item}</span></li>`)
    .join('');
  document.getElementById('modalActionBtn').onclick = () => {
    closeCampaignModal();
    selectServiceAndScroll(data.serviceTarget);
  };
  campaignModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCampaignModal() {
  if (!campaignModal) return;
  campaignModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (campaignModal && campaignModal.classList.contains('open')) closeCampaignModal();
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) setMobileMenuState(false);
  }
});

// 7. Camera Viewfinder Custom Cursor (Desktop + Mobile Touch)
(function initCameraCursor() {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const dot = document.getElementById('camCursorDot');
  const frame = document.getElementById('camCursorFrame');
  const labelEl = document.getElementById('camCursorLabel');
  if (!dot || !frame) return;

  if (!isFinePointer) {
    let touchFadeTimer = null;
    function triggerTouchAutofocus(touch, isTap) {
      const x = touch.clientX, y = touch.clientY;
      const target = document.elementFromPoint(x, y);
      const cardTarget = target && target.closest('.bento-card[onclick], #work .bento-card');
      const interactiveTarget = target && target.closest('a, button, [role="button"], .service-pill');
      clearTimeout(touchFadeTimer);
      dot.style.opacity = '1';
      dot.style.background = isTap ? '#FF5E3A' : '#F59E0B';
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame.classList.remove('touch-focus', 'has-label', 'is-hovering');
      frame.style.setProperty('--tx', `${x}px`);
      frame.style.setProperty('--ty', `${y}px`);
      frame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (cardTarget) { labelEl.textContent = cardTarget.closest('#work') ? 'CASE' : 'PREVIEW'; frame.classList.add('has-label'); }
      else if (interactiveTarget) { labelEl.textContent = 'FOCUS'; frame.classList.add('has-label'); }
      void frame.offsetWidth;
      frame.style.opacity = '1';
      frame.classList.add('touch-focus');
      touchFadeTimer = setTimeout(() => {
        dot.style.opacity = '0';
        frame.style.opacity = '0';
        frame.classList.remove('touch-focus', 'has-label');
      }, 650);
    }
    window.addEventListener('touchstart', e => { if (e.touches?.[0]) triggerTouchAutofocus(e.touches[0], true); }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (e.touches?.[0]) {
        const x = e.touches[0].clientX, y = e.touches[0].clientY;
        clearTimeout(touchFadeTimer);
        frame.classList.remove('touch-focus');
        dot.style.opacity = '1'; dot.style.background = '#F59E0B'; dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        frame.style.opacity = '0.9'; frame.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }, { passive: true });
    window.addEventListener('touchend', () => {
      clearTimeout(touchFadeTimer);
      touchFadeTimer = setTimeout(() => { dot.style.opacity = '0'; frame.style.opacity = '0'; frame.classList.remove('touch-focus', 'has-label'); }, 320);
    }, { passive: true });
    return;
  }

  document.body.classList.add('has-custom-cursor');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, frameX = mouseX, frameY = mouseY, isVisible = false;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!isVisible) { isVisible = true; dot.style.opacity = '1'; frame.style.opacity = '1'; frameX = mouseX; frameY = mouseY; }
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    const target = e.target;
    const cardTarget = target.closest('.bento-card[onclick], #work .bento-card');
    const interactiveTarget = target.closest('a, button, [role="button"], .service-pill, .cursor-pointer');
    const inputTarget = target.closest('input, textarea');
    if (inputTarget) {
      frame.style.opacity = '0.25';
      frame.classList.remove('is-hovering', 'has-label');
    } else {
      frame.style.opacity = '1';
      if (cardTarget) { labelEl.textContent = cardTarget.closest('#work') ? 'CASE' : 'PREVIEW'; frame.classList.add('has-label'); frame.classList.remove('is-hovering'); }
      else if (interactiveTarget) { frame.classList.remove('has-label'); frame.classList.add('is-hovering'); }
      else { frame.classList.remove('is-hovering', 'has-label'); }
    }
  }, { passive: true });

  (function animateCursorFrame() {
    frameX += (mouseX - frameX) * 0.2;
    frameY += (mouseY - frameY) * 0.2;
    frame.style.transform = `translate3d(${frameX.toFixed(2)}px, ${frameY.toFixed(2)}px, 0)`;
    requestAnimationFrame(animateCursorFrame);
  })();

  window.addEventListener('mousedown', () => { frame.classList.add('is-clicking'); dot.style.background = '#FF5E3A'; });
  window.addEventListener('mouseup', () => { frame.classList.remove('is-clicking'); dot.style.background = '#F59E0B'; });
  document.addEventListener('mouseleave', () => { isVisible = false; dot.style.opacity = '0'; frame.style.opacity = '0'; });
})();
