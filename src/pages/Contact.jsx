import { useEffect, useState } from 'react';
import api from '../api/axios';
import logo from '../assets/tasklogo.jpeg';

const safeExternalLink = (value, allowBotim = false) => {
  try {
    const url = new URL(value);
    const protocols = allowBotim ? ['https:', 'http:', 'botim:'] : ['https:', 'http:'];
    return protocols.includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const Contact = () => {
  const [contact, setContact] = useState(null);

  useEffect(() => {
    api.get('/admin/contact-links/')
      .then((response) => setContact(response.data || {}))
      .catch(() => setContact({}));
  }, []);

  const whatsappNumber = String(contact?.whatsapp_contact_number || contact?.support_phone || '')
    .replace(/\D/g, '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  const botimLink = safeExternalLink(contact?.botim_contact_link, true);

  return (
    <section className="min-h-[70vh] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <header className="neon-card p-6 text-center sm:p-8">
          <img src={logo} alt="INSTOVA" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-300">Contact Us</p>
          <h1 className="mt-2 text-2xl font-black text-white">
            {contact?.contact_admin_name || 'Official Support Team'}
          </h1>
          {contact?.contact_admin_purpose && (
            <p className="mt-2 text-sm text-white/70">{contact.contact_admin_purpose}</p>
          )}
        </header>

        {contact?.contact_instructions && (
          <section className="neon-card p-5 sm:p-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-pink-200">Instructions</h2>
            <p className="whitespace-pre-line text-sm leading-6 text-white/80">{contact.contact_instructions}</p>
          </section>
        )}

        {whatsappNumber && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-card flex items-center gap-4 p-5 transition hover:border-green-400/60"
          >
            {contact?.whatsapp_icon
              ? <img src={contact.whatsapp_icon} alt="" className="h-12 w-12 shrink-0 rounded-xl object-contain" />
              : <span aria-hidden="true" className="text-3xl">💬</span>}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-white/60">WhatsApp Support</span>
              <span className="mt-1 block break-all text-lg font-bold text-white">{contact.whatsapp_contact_number || contact.support_phone}</span>
            </span>
            <span className="rounded-full bg-green-500 px-4 py-2 text-xs font-bold text-white">Chat</span>
          </a>
        )}

        {contact?.botim_contact_number && (
          <a
            href={botimLink || undefined}
            target={botimLink ? '_blank' : undefined}
            rel={botimLink ? 'noopener noreferrer' : undefined}
            className={`neon-card flex items-center gap-4 p-5 ${botimLink ? 'transition hover:border-blue-400/60' : ''}`}
          >
            {contact.botim_icon
              ? <img src={contact.botim_icon} alt="" className="h-12 w-12 shrink-0 rounded-xl object-contain" />
              : <span aria-hidden="true" className="text-3xl">📞</span>}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-white/60">Botim Contact</span>
              <span className="mt-1 block break-all text-lg font-bold text-white">{contact.botim_contact_number}</span>
            </span>
            {botimLink && (
              <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">Open</span>
            )}
          </a>
        )}

        <section className="neon-card p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-pink-200">Official Channels</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'WhatsApp Channel', href: safeExternalLink(contact?.whatsapp_channel_link) },
              { label: 'WhatsApp Community', href: safeExternalLink(contact?.whatsapp_community_link) },
            ].filter((item) => item.href).map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="neon-btn neon-btn-block py-3 text-center text-sm">
                {item.label}
              </a>
            ))}
          </div>
          {!whatsappNumber && !contact?.botim_contact_number && !contact?.whatsapp_channel_link && !contact?.whatsapp_community_link && (
            <p className="text-sm text-white/60">Contact details are not available right now.</p>
          )}
        </section>
      </div>
    </section>
  );
};

export default Contact;
