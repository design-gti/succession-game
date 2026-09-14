export const isKiosk =
  window.location.pathname === '/kiosk' ||
  new URLSearchParams(window.location.search).get('kiosk') === '1'
