import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { browsers, contactCards, contactSubjects, faqGroups, issueCategories } from '../data/appData';
import { PageTransition } from '../components/common';

export function SupportShell({ eyebrow, title, subtitle, children }) {
  return (
    <PageTransition>
      <section className="support-page">
        <div className="support-hero">
          <p className="eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </PageTransition>
  );
}

export function FormField({ label, children, wide = false }) {
  return (
    <label className={`form-field ${wide ? 'wide' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ReportBugPage() {
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState('');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
  };

  if (submitted) {
    return (
      <SupportShell
        eyebrow="SUPPORT"
        title="Report a Technical Issue"
        subtitle="Facing a problem? Help us improve LetsDuel by reporting the issue."
      >
        <motion.div className="success-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <strong>✅ Thank you!</strong>
          <p>Your bug report has been submitted successfully.</p>
          <p>Our team will review it and get back to you if needed.</p>
        </motion.div>
      </SupportShell>
    );
  }

  return (
    <SupportShell
      eyebrow="REPORT BUG"
      title="Report a Technical Issue"
      subtitle="Facing a problem? Help us improve LetsDuel by reporting the issue."
    >
      <form className="support-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <FormField label="Full Name (optional)"><input type="text" /></FormField>
        <FormField label="Email Address"><input type="email" required /></FormField>
        <FormField label="Issue Category"><select required>{issueCategories.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Page where issue occurred"><input type="text" required /></FormField>
        <FormField label="Problem Description" wide><textarea rows="6" required /></FormField>
        <FormField label="Steps to Reproduce (optional)" wide><textarea rows="4" /></FormField>
        <FormField label="Browser"><select required>{browsers.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Operating System"><input type="text" required /></FormField>
        <div
          className="upload-zone wide"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFile(event.dataTransfer.files[0]);
          }}
        >
          {preview ? (
            <div className="upload-preview">
              <img src={preview} alt="Uploaded screenshot preview" />
              <button type="button" onClick={() => setPreview('')}>Remove image</button>
            </div>
          ) : (
            <>
              <strong>Upload Screenshot</strong>
              <p>Drag & drop an image here, or browse files.</p>
              <input type="file" accept="image/*" onChange={(event) => handleFile(event.target.files[0])} />
            </>
          )}
        </div>
        <button className="support-submit wide" type="submit">Submit Report</button>
      </form>
    </SupportShell>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SupportShell
      eyebrow="CONTACT"
      title="Contact LetsDuel"
      subtitle="Have a question, partnership proposal, feature suggestion, or need help? We'd love to hear from you."
    >
      <div className="contact-grid">
        {contactCards.map(([icon, title, text]) => (
          <article className="contact-card" key={title}>
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <form className="support-form contact-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <FormField label="Name"><input type="text" required /></FormField>
        <FormField label="Email"><input type="email" required /></FormField>
        <FormField label="Subject" wide><select required>{contactSubjects.map((item) => <option key={item}>{item}</option>)}</select></FormField>
        <FormField label="Message" wide><textarea rows="7" placeholder="Write your message..." required /></FormField>
        <button className="support-submit wide" type="submit">Send Message</button>
        {submitted && <p className="form-success wide">Thanks for contacting us! We&apos;ll reply within 24-48 hours.</p>}
      </form>
    </SupportShell>
  );
}

export function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article className={`faq-item ${open ? 'is-open' : ''}`} layout>
      <button type="button" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <b>{open ? '−' : '+'}</b>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export function FAQPage() {
  return (
    <SupportShell
      eyebrow="FAQS"
      title="Frequently Asked Questions"
      subtitle="Find answers to the most common questions about LetsDuel."
    >
      <div className="faq-stack">
        {faqGroups.map((group) => (
          <section className="faq-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.items.map(([question, answer]) => (
              <FAQItem key={question} question={question} answer={answer} />
            ))}
          </section>
        ))}
      </div>
    </SupportShell>
  );
}
