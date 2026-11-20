/*
 * Google Analytics for dxn.is, plus the events that show whether a visit
 * turned into a lead.
 *
 * Visits that are not counted:
 *   - automated browsers (navigator.webdriver), which covers agent tests;
 *   - any browser that opened a page with ?notrack=1 (undo with ?notrack=0).
 * Add ?trackdebug=1 to force tracking in an automated browser and print each
 * event to the console instead of sending it.
 *
 * Events (window.dxnTrack):
 *   contact_form_sent        contact form accepted by Web3Forms
 *   call_booked              Calendly reports a scheduled meeting
 *   call_booking_opened      Book a Call opened the Calendly popup
 *   newsletter_signup_started  subscribe form sent the reader to Beehiiv
 *   newsletter_issue_click   latest-issue card clicked
 *   cta_click                a Book a call / Let's talk link, with cta_location
 */
(function () {
  var GA_ID = 'G-B6XBS99YCY';
  var search = window.location.search || '';
  var debug = /[?&]trackdebug=1/.test(search);
  var optedOut = false;

  try {
    if (/[?&]notrack=1/.test(search)) localStorage.setItem('dxn-notrack', '1');
    if (/[?&]notrack=0/.test(search)) localStorage.removeItem('dxn-notrack');
    optedOut = localStorage.getItem('dxn-notrack') === '1';
  } catch (e) { /* storage blocked: count the visit */ }

  var automated = navigator.webdriver === true;
  var off = !debug && (optedOut || automated);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  if (debug) {
    window.dxnTrack = function (name, params) {
      console.log('[dxn-track]', name, JSON.stringify(params || {}));
    };
    return;
  }

  if (off) {
    window.dxnTrack = function () {};
    return;
  }

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  window.dxnTrack = function (name, params) {
    window.gtag('event', name, params || {});
  };
})();
