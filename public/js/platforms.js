/* Shared platform definitions used by BOTH the public page and the admin panel.
 * To support a new platform, just add an entry here — both pages pick it up. */
window.PLATFORMS = [
  { key: 'phone',     label: 'Call',      icon: 'fa-solid fa-phone',         color: '#16a34a', type: 'phone',    placeholder: '+94 11 234 5678' },
  { key: 'phone2',    label: 'Call (2nd)', icon: 'fa-solid fa-phone',        color: '#16a34a', type: 'phone',    placeholder: '+94 11 234 5679 (second number)' },
  { key: 'whatsapp',  label: 'WhatsApp',  icon: 'fa-brands fa-whatsapp',     color: '#25D366', type: 'whatsapp', placeholder: '94771234567 (digits, country code, no +)' },
  { key: 'email',     label: 'Email',     icon: 'fa-solid fa-envelope',      color: '#ea4335', type: 'email',    placeholder: 'info@company.com' },
  { key: 'website',   label: 'Website',   icon: 'fa-solid fa-globe',         color: '#2563eb', type: 'url',      placeholder: 'https://company.com' },
  { key: 'facebook',  label: 'Facebook',  icon: 'fa-brands fa-facebook',     color: '#1877F2', type: 'url',      placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram', icon: 'fa-brands fa-instagram',    color: '#E1306C', type: 'url',      placeholder: 'https://instagram.com/...' },
  { key: 'tiktok',    label: 'TikTok',    icon: 'fa-brands fa-tiktok',       color: '#010101', type: 'url',      placeholder: 'https://tiktok.com/@...' },
  { key: 'youtube',   label: 'YouTube',   icon: 'fa-brands fa-youtube',      color: '#FF0000', type: 'url',      placeholder: 'https://youtube.com/@...' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: 'fa-brands fa-linkedin',     color: '#0A66C2', type: 'url',      placeholder: 'https://linkedin.com/company/...' },
  { key: 'telegram',  label: 'Telegram',  icon: 'fa-brands fa-telegram',     color: '#229ED9', type: 'url',      placeholder: 'https://t.me/...' },
  { key: 'maps',      label: 'Location',  icon: 'fa-solid fa-location-dot',  color: '#0F9D58', type: 'url',      placeholder: 'https://maps.google.com/...' },
];

/* Turn a stored value into a clickable href based on the platform type. */
window.buildHref = function buildHref(type, value) {
  const v = String(value || '').trim();
  if (!v) return '';
  switch (type) {
    case 'phone':    return 'tel:' + v.replace(/\s+/g, '');
    case 'whatsapp': return 'https://wa.me/' + v.replace(/[^\d]/g, '');
    case 'email':    return 'mailto:' + v;
    case 'url':      return /^https?:\/\//i.test(v) ? v : 'https://' + v;
    default:         return v;
  }
};

/* Resolve a logo value: full URL/path as-is, otherwise look in /logos/. */
window.resolveLogo = function resolveLogo(logo) {
  const v = String(logo || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v) || v.startsWith('/')) return v;
  return '/logos/' + v;
};
