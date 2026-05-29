// ─────────────────────────────────────────────────────────────────────────────
// LegalPage — Privacy Policy + Terms and Conditions
// type: 'privacy' | 'terms'
// ─────────────────────────────────────────────────────────────────────────────

const PRIVACY = {
  title: 'Privacy Policy',
  updated: 'June 2026',
  sections: [
    {
      h2: '1. Controller',
      body: [
        { p: 'Sascha Cwetanski · Bornholmring 20 · 23560 Luebeck, Germany' },
        { p: 'Email: contactme@fxledger.com · Website: www.fxledger.com' },
      ],
    },
    {
      h2: '2. What Data We Collect and Why',
      body: [
        { h3: '2.1 Registration and User Account' },
        { p: 'When you register, we collect your email address and a password of your choice. Your password is stored in encrypted form and is technically neither accessible nor recoverable by us.' },
        { small: 'Legal basis: Art. 6(1)(b) GDPR (performance of a contract)' },
        { h3: '2.2 Trading Data' },
        { p: 'The data you enter in your trading journal (e.g. trades, notes, analytics) is stored solely for the purpose of providing the service. This data belongs to you — we do not analyze it and do not share it with third parties.' },
        { small: 'Legal basis: Art. 6(1)(b) GDPR (performance of a contract)' },
        { h3: '2.3 Server Log Data' },
        { p: 'When you access FxLedger, technical data is automatically collected (IP address, browser type, timestamp). This data is used solely for the secure operation of the service and is deleted after a maximum of 30 days.' },
        { small: 'Legal basis: Art. 6(1)(f) GDPR (legitimate interest)' },
      ],
    },
    {
      h2: '3. Third-Party Service Providers',
      body: [
        { p: 'We use the following external services, with each of which we have concluded a Data Processing Agreement (DPA) in accordance with Art. 28 GDPR:' },
        { h3: '3.1 Hetzner Online GmbH (Hosting)' },
        { p: 'Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany. All data is stored exclusively in German and EU-based data centers.' },
        { link: 'hetzner.com/legal/privacy-policy', href: 'https://www.hetzner.com/legal/privacy-policy' },
        { h3: '3.2 Anthropic, PBC (AI Features)' },
        { p: 'For certain AI-powered features, we use the Claude API provided by Anthropic, PBC, 548 Market St., San Francisco, CA 94104, USA. Data transfers to the USA are carried out on the basis of Standard Contractual Clauses (Art. 46(2)(c) GDPR).' },
        { link: 'anthropic.com/privacy', href: 'https://www.anthropic.com/privacy' },
        { h3: '3.3 Google Analytics' },
        { p: 'We use Google Analytics, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Google Analytics uses cookies and collects anonymized usage data. IP anonymization is enabled. You can opt out at tools.google.com/dlpage/gaoptout.' },
        { small: 'Legal basis: Art. 6(1)(a) GDPR (consent via cookie banner)' },
        { h3: '3.4 Stripe, Inc. (Payment Processing)' },
        { p: 'Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin 2, Ireland. Stripe processes payment data in accordance with PCI-DSS standards. We do not store any payment data ourselves.' },
        { link: 'stripe.com/privacy', href: 'https://stripe.com/privacy' },
      ],
    },
    {
      h2: '4. Cookies',
      body: [
        { p: 'FxLedger uses technically necessary cookies (e.g. to maintain your login session). Cookies for Google Analytics are only set after your explicit consent.' },
      ],
    },
    {
      h2: '5. Your Rights',
      body: [
        { p: 'Under the GDPR, you have the following rights:' },
        { list: [
          'Access (Art. 15 GDPR): Request information about the data we hold about you',
          'Rectification (Art. 16 GDPR): Correction of inaccurate data',
          'Erasure (Art. 17 GDPR): Deletion of your account and all associated data',
          'Restriction (Art. 18 GDPR): Restriction of processing',
          'Data portability (Art. 20 GDPR): Export of your data in machine-readable format',
          'Objection (Art. 21 GDPR): Objection to processing based on legitimate interests',
        ]},
        { p: 'To exercise your rights, contact us at: contactme@fxledger.com' },
        { p: 'You also have the right to lodge a complaint with the Independent Centre for Privacy Protection Schleswig-Holstein (ULD): datenschutzzentrum.de' },
      ],
    },
    {
      h2: '6. Data Security',
      body: [
        { p: 'All data transmissions are encrypted via HTTPS/TLS. Passwords are stored as hashes and are not accessible to us.' },
      ],
    },
    {
      h2: '7. Account Deletion',
      body: [
        { p: 'You can delete your account and all associated data at any time. After deletion, all personal data will be irreversibly removed within 30 days.' },
      ],
    },
    {
      h2: '8. Changes to This Privacy Policy',
      body: [
        { p: 'We reserve the right to update this policy when the service or applicable law changes. The current version is always available at www.fxledger.com/privacy.' },
      ],
    },
  ],
};

const TERMS = {
  title: 'Terms and Conditions',
  updated: 'June 2026',
  sections: [
    {
      h2: '§ 1 Scope',
      body: [
        { p: 'These Terms and Conditions govern the use of the web application FxLedger (hereinafter "Service"), operated by Klaus Meier (hereinafter "Provider"). By registering, the user accepts these Terms and Conditions.' },
      ],
    },
    {
      h2: '§ 2 Service Description',
      body: [
        { p: 'FxLedger is a web-based trading journal that allows users to document and analyze their own trading transactions. The Service is offered in three plans:' },
        { table: {
          headers: ['Plan', 'Price', 'Features'],
          rows: [
            ['Free', '€0.00 / month', 'Basic features, limited entries'],
            ['Basic', '€10.00 / month', 'Extended features'],
            ['Premium', '€30.00 / month', 'All features, unlimited entries'],
          ],
        }},
        { p: 'The current features of each plan are described at www.fxledger.com/pricing.' },
      ],
    },
    {
      h2: '§ 3 Registration and User Account',
      body: [
        { p: '(1) Use of the Service requires registration with a valid email address and password.' },
        { p: '(2) The user is obligated to keep their login credentials confidential and to notify the Provider immediately if unauthorized access to their account becomes known.' },
        { p: '(3) Only one account per person is permitted.' },
        { p: '(4) The Provider reserves the right to suspend or delete accounts in the event of a violation of these Terms and Conditions.' },
      ],
    },
    {
      h2: '§ 4 Contract and Subscription',
      body: [
        { p: '(1) Paid subscriptions (Basic, Premium) are concluded by selecting a plan and completing the payment process.' },
        { p: '(2) Subscriptions are billed monthly and renew automatically unless cancelled in time.' },
        { p: "(3) Billing is handled by the payment service provider Stripe. Stripe's own terms of service apply additionally." },
      ],
    },
    {
      h2: '§ 5 Cancellation',
      body: [
        { p: '(1) Paid subscriptions may be cancelled at any time, effective at the end of the current billing period.' },
        { p: '(2) Cancellation is done via account settings at www.fxledger.com/account or by email to contactme@fxledger.com.' },
        { p: '(3) Upon cancellation, the account is downgraded to the Free plan. Stored data is retained unless the user deletes their account.' },
        { p: "(4) The Provider may terminate the contract with 30 days' notice to the end of the month." },
      ],
    },
    {
      h2: '§ 6 Pricing and Payment',
      body: [
        { p: '(1) Current prices are listed at www.fxledger.com/pricing. All prices are inclusive of applicable VAT where required.' },
        { p: '(2) The Provider operates as a small business under § 19 of the German VAT Act (UStG) and therefore does not charge VAT.' },
        { p: '(3) Payment is made monthly in advance by credit card or other payment methods supported by Stripe.' },
        { p: '(4) In the event of a failed payment, the Provider reserves the right to restrict access to paid features until payment is received.' },
      ],
    },
    {
      h2: '§ 7 Disclaimer',
      body: [
        { p: '(1) FxLedger is solely a tool for personal documentation of trading transactions. The Service does not constitute investment advice, financial advice, or trading recommendations of any kind.' },
        { p: '(2) All analytics and statistics displayed in the Service are based exclusively on data entered by the user. The Provider assumes no responsibility for any trading decisions made on the basis of this data.' },
        { p: '(3) The Provider is not liable for any damages arising from the use or inability to use the Service, to the extent permitted by law.' },
        { p: '(4) In cases of simple negligence, liability is limited to breaches of material contractual obligations, and only up to the foreseeable, contract-typical damage.' },
        { p: '(5) The above limitations do not apply in cases of intent, gross negligence, or damages resulting from injury to life, body, or health.' },
      ],
    },
    {
      h2: '§ 8 Availability',
      body: [
        { p: '(1) The Provider strives for the highest possible availability of the Service but does not guarantee uninterrupted availability.' },
        { p: '(2) Maintenance work will be carried out outside peak usage hours where possible.' },
      ],
    },
    {
      h2: '§ 9 User Data and Ownership',
      body: [
        { p: '(1) All data entered by the user (trading data, notes, etc.) remains the property of the user.' },
        { p: '(2) The Provider uses this data solely to provide the Service and does not share it with third parties.' },
        { p: '(3) The user may export their data at any time and delete their account.' },
      ],
    },
    {
      h2: '§ 10 Changes to These Terms',
      body: [
        { p: '(1) The Provider reserves the right to amend these Terms and Conditions for legitimate reasons.' },
        { p: '(2) Changes will be communicated to the user by email at least 30 days before they take effect. If the user does not object within this period, the new Terms are deemed accepted.' },
        { p: '(3) In the event of an objection, the user has the right to terminate the contract with immediate effect.' },
      ],
    },
    {
      h2: '§ 11 Final Provisions',
      body: [
        { p: '(1) The laws of the Federal Republic of Germany apply.' },
        { p: '(2) Should any provision of these Terms be invalid, the validity of the remaining provisions shall not be affected.' },
        { p: "(3) The place of jurisdiction is, to the extent permitted by law, the Provider's place of business." },
      ],
    },
  ],
};

// ── Renderer ─────────────────────────────────────────────────────────────────

function Body({ t, items }) {
  return items.map((item, i) => {
    if (item.h3) return (
      <div key={i} style={{
        fontFamily: t.serif, fontWeight: 500, fontSize: 16,
        color: t.ink, marginTop: 20, marginBottom: 6,
      }}>{item.h3}</div>
    );
    if (item.p) return (
      <p key={i} style={{
        fontFamily: t.sans, fontSize: 14, color: t.ink2,
        lineHeight: 1.7, margin: '0 0 10px',
      }}>{item.p}</p>
    );
    if (item.small) return (
      <p key={i} style={{
        fontFamily: t.serif, fontStyle: 'italic', fontSize: 12,
        color: t.ink3, margin: '0 0 14px',
      }}>{item.small}</p>
    );
    if (item.link) return (
      <p key={i} style={{ margin: '0 0 10px' }}>
        <a href={item.href} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: t.sans, fontSize: 13, color: t.accent }}>
          {item.link}
        </a>
      </p>
    );
    if (item.list) return (
      <ul key={i} style={{ margin: '0 0 12px', paddingLeft: 20 }}>
        {item.list.map((li, j) => (
          <li key={j} style={{
            fontFamily: t.sans, fontSize: 14, color: t.ink2,
            lineHeight: 1.7, marginBottom: 4,
          }}>{li}</li>
        ))}
      </ul>
    );
    if (item.table) return (
      <div key={i} style={{ overflowX: 'auto', margin: '0 0 14px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {item.table.headers.map((h, j) => (
                <th key={j} style={{
                  fontFamily: t.sans, fontWeight: 600, color: t.ink,
                  textAlign: 'left', padding: '8px 12px',
                  borderBottom: `1px solid ${t.rule2}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.table.rows.map((row, j) => (
              <tr key={j}>
                {row.map((cell, k) => (
                  <td key={k} style={{
                    fontFamily: t.sans, color: t.ink2, padding: '8px 12px',
                    borderBottom: `1px solid ${t.rule}`,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    return null;
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LegalPage({ t, type, onBack }) {
  const doc = type === 'privacy' ? PRIVACY : TERMS;

  return (
    <div style={{ flex: 1, padding: '56px 72px 60px', overflow: 'auto', minWidth: 0 }}>
      {/* Back */}
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: t.sans, fontSize: 13, color: t.ink3,
        padding: 0, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        ← Back
      </button>

      {/* Header */}
      <header style={{ marginBottom: 48, maxWidth: 680 }}>
        <div style={{
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 13,
          color: t.ink3, marginBottom: 10,
        }}>Last updated: {doc.updated}</div>
        <h1 style={{
          fontFamily: t.serif, fontWeight: 400, fontSize: 40,
          margin: 0, letterSpacing: -0.8, lineHeight: 1.1, color: t.ink,
        }}>{doc.title}</h1>
      </header>

      {/* Sections */}
      <div style={{ maxWidth: 680 }}>
        {doc.sections.map((sec, i) => (
          <section key={i} style={{
            marginBottom: 36,
            paddingBottom: 36,
            borderBottom: i < doc.sections.length - 1 ? `1px solid ${t.rule}` : 'none',
          }}>
            <h2 style={{
              fontFamily: t.serif, fontWeight: 400, fontSize: 22,
              color: t.ink, margin: '0 0 16px', letterSpacing: -0.3,
            }}>{sec.h2}</h2>
            <Body t={t} items={sec.body} />
          </section>
        ))}
      </div>
    </div>
  );
}
