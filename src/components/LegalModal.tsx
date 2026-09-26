import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, ShieldCheck, FileText, Mail, CheckCircle, Lock, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type LegalTab = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  onTabChange?: (tab: LegalTab) => void;
}

export default function LegalModal({ isOpen, initialTab = 'terms', onClose, onTabChange }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const handleTabClick = (tab: LegalTab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#0d0f17] border border-[#1e2336] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#1e2336] bg-[#141722]/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                {activeTab === 'terms' && <FileText size={18} className="text-emerald-400" />}
                {activeTab === 'privacy' && <ShieldCheck size={18} className="text-blue-400" />}
                {activeTab === 'disclaimer' && <ShieldAlert size={18} className="text-amber-400" />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  <span>DIH HUB Legal Documentation</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    Updated: Feb 2026
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Official Terms of Service, Privacy Policy & Legal Disclaimers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Dialog"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-[#1e2336] bg-[#0d0f17]/90 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => handleTabClick('terms')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'terms'
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <FileText size={13} />
              <span>Terms & Conditions</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('privacy')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'privacy'
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <ShieldCheck size={13} />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('disclaimer')}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeTab === 'disclaimer'
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <ShieldAlert size={13} />
              <span>Disclaimer & Legal Notice</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-xs sm:text-[13px] leading-relaxed text-slate-300">
            {/* TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 flex items-start gap-3">
                  <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-emerald-200 text-sm">Terms & Conditions</h4>
                    <p className="text-[11px] text-emerald-300/90 mt-1">
                      Last updated: February 25, 2026. These Terms and Conditions govern your use of the DIH HUB website and services. By accessing or using our Service, you agree to be bound by these Terms and Conditions.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Interpretation and Definitions
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Account:</strong> A unique account created for You to access Our Service or parts of Our Service.</li>
                    <li><strong>Company:</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;) refers to <strong>DIH HUB</strong>.</li>
                    <li><strong>Jurisdiction:</strong> Refers to the operational jurisdiction of the Service and applicable international electronic commerce standards.</li>
                    <li><strong>Service:</strong> Refers to the Website and digital services provided through DIH HUB.</li>
                    <li><strong>Website:</strong> Refers to DIH HUB, accessible from <a href="https://dihhub.site" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">https://dihhub.site</a>.</li>
                    <li><strong>User / You:</strong> The individual accessing or using the Service, or legal entity represented.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Acknowledgment
                  </h4>
                  <p className="text-slate-300">
                    These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms set out the rights and obligations of all users regarding the use of the Service. Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    User Accounts & Security
                  </h4>
                  <p className="text-slate-300">
                    When You create an account with Us, You must provide accurate, complete, and current information. You are responsible for safeguarding your credentials and for any activities or actions under your account. You agree not to disclose your password to any third party and must notify Us immediately of any unauthorized use.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Use of the Service & Prohibited Conduct
                  </h4>
                  <p className="text-slate-300">You agree that You will not:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Use the Service for any unlawful or fraudulent purpose.</li>
                    <li>Attempt to gain unauthorized access to the Service or its systems.</li>
                    <li>Interfere with or disrupt the operation or security of the Service.</li>
                    <li>Attempt to reverse-engineer, modify, or exploit any part of the Service without authorization.</li>
                    <li>Deploy automated systems to abuse, overload, or disrupt the Service.</li>
                    <li>Upload or transmit malicious code, viruses, or other harmful materials.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Payments, Wallet & Purchases
                  </h4>
                  <p className="text-slate-300">
                    Certain digital features and utilities require payment. Prices, fees, and available payment methods (including automated payment partners like Paynicorn, UPI, local mobile wallets, and card rails) are displayed on the Website. You are responsible for any applicable taxes or fees associated with Your purchases.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Refunds and Cancellations
                  </h4>
                  <p className="text-slate-300">
                    Due to the instantaneous and automated fulfillment of digital services, orders currently in active processing cannot be cancelled manually. If an order is cancelled or partially fulfilled by provider infrastructure, the unfulfilled amount is refunded directly back to your <strong>DIH HUB wallet balance</strong>.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Intellectual Property & Third-Party Links
                  </h4>
                  <p className="text-slate-300">
                    The Service and its original content, features, and functionality remain the exclusive property of DIH HUB and its licensors. Third-party brand names or trademarks referenced for compatibility are property of their respective owners. DIH HUB assumes no responsibility for third-party websites or services.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Limitation of Liability & &ldquo;AS IS&rdquo; Disclaimer
                  </h4>
                  <p className="text-slate-300">
                    The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. To the maximum extent permitted by applicable law, DIH HUB and its operators shall not be liable for any indirect, incidental, special, or consequential damages.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Governing Law & Dispute Resolution
                  </h4>
                  <p className="text-slate-300">
                    These Terms and Conditions shall be governed by and construed in accordance with applicable international electronic commerce principles and cross-border digital service guidelines. In case of any concern, You agree to first attempt to resolve disputes informally by contacting Us at <a href="mailto:contact@dihhub.site" className="text-emerald-400 underline font-semibold">contact@dihhub.site</a>.
                  </p>
                </section>
              </div>
            )}

            {/* PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-300 flex items-start gap-3">
                  <Lock size={16} className="shrink-0 mt-0.5 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-blue-200 text-sm">Privacy Policy</h4>
                    <p className="text-[11px] text-blue-300/90 mt-1">
                      Last updated: February 25, 2026. This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Interpretation and Definitions
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Account:</strong> A unique account created for You to access Our Service or parts of Our Service.</li>
                    <li><strong>Company:</strong> Refers to <strong>DIH HUB</strong>.</li>
                    <li><strong>Territory:</strong> Refers to worldwide access, subject to applicable local and international data protection regulations.</li>
                    <li><strong>Personal Data:</strong> Any information that relates to an identified or identifiable individual.</li>
                    <li><strong>Service:</strong> Refers to the Website and digital utilities accessible at <a href="https://dihhub.site" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">https://dihhub.site</a>.</li>
                    <li><strong>Usage Data:</strong> Data collected automatically, either generated by the use of the Service or from the Service infrastructure.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Collecting and Using Your Personal Information
                  </h4>
                  <p className="text-slate-300"><strong>Personal Data:</strong> While using Our Service, We may ask You to provide personally identifiable information including:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Account authentication records & transaction identifiers</li>
                  </ul>
                  <p className="text-slate-300 mt-2"><strong>Usage Data:</strong> Automatically collected data such as Your Device's IP address, browser type and version, pages visited, time spent, and diagnostic telemetry.</p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Tracking Technologies and Cookies
                  </h4>
                  <p className="text-slate-300">
                    We use cookies and similar technologies to track activity and improve Our Service:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Necessary / Essential Cookies (Session):</strong> Essential to authenticate users, prevent fraudulent access, and maintain active sessions.</li>
                    <li><strong>Cookies Policy Acceptance Cookies (Persistent):</strong> Record consent preferences.</li>
                    <li><strong>Functionality Cookies (Persistent):</strong> Remember preferences such as theme configuration, active tool sessions, and localized parameters.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Text Messages (SMS) & Notifications Privacy Notice
                  </h4>
                  <p className="text-slate-300">
                    You have the option to receive security alerts and order updates. <strong>No mobile information will be shared with or sold to third parties or affiliates for marketing or promotional purposes.</strong> Phone numbers and consent records are strictly used for functional delivery. You may opt out anytime by replying STOP or contacting support.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Retention & Deletion of Your Personal Data
                  </h4>
                  <p className="text-slate-300">
                    The Company retains Personal Data only as long as necessary: User accounts (duration of relationship plus up to 24 months post-closure), support correspondence (up to 24 months), and server diagnostic logs (up to 24 months).
                  </p>
                  <p className="text-slate-300">
                    You have the right to delete or request assistance in deleting your stored Personal Data. You may contact Us at <a href="mailto:contact@dihhub.site" className="text-blue-400 underline font-semibold">contact@dihhub.site</a> to initiate data deletion.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Security & Children&apos;s Privacy
                  </h4>
                  <p className="text-slate-300">
                    The security of Your Personal Data is paramount, and We use commercially reasonable encryption means. Sensitive payment card details are processed directly through PCI-compliant automated payment gateways and never stored on Our servers. Our Service is not directed to anyone under the age of 16.
                  </p>
                </section>
              </div>
            )}

            {/* DISCLAIMER & LEGAL NOTICE */}
            {activeTab === 'disclaimer' && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 flex items-start gap-3">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-amber-200 text-sm">Legal Notice & Fair Use Statement</h4>
                    <p className="text-[11px] text-amber-300/90 mt-1">
                      Operational boundaries, third-party trademark acknowledgments, and fair use guidelines governing DIH HUB.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    1. Educational & Professional Utility Notice
                  </h4>
                  <p className="text-slate-300">
                    All tools hosted on DIH Hub (including developer encryption utilities, QR creators, DEX and APK tools, media helpers, and productivity modules) are provided for legitimate developer, enterprise, educational, and testing purposes. Users bear total liability for how they utilize output generated by these utilities.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    2. Third-Party Trademarks & Platform Independence
                  </h4>
                  <p className="text-slate-300">
                    Any third-party trademarks, logos, brand names, or service names mentioned on DIH Hub (including but not limited to Instagram, Facebook, TikTok, YouTube, Telegram, Twitter/X, Spotify, Discord, or Google) are the registered property of their respective trademark holders.
                  </p>
                  <p className="text-slate-300">
                    DIH Hub is an independent platform and is not affiliated with, sponsored by, endorsed by, or in partnership with any of these third-party corporations.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    3. Limitation of Liability
                  </h4>
                  <p className="text-slate-300">
                    In no event shall DIH Hub, its operators, founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the platform.
                  </p>
                </section>
              </div>
            )}
          </div>

          {/* Footer Contact Bar */}
          <div className="px-6 py-3.5 border-t border-[#1e2336] bg-[#141722]/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-[11px]">
              <Mail size={13} className="text-indigo-400" />
              <span>Contact:</span>
              <a 
                href="mailto:contact@dihhub.site" 
                className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-dotted"
              >
                contact@dihhub.site
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">Global Digital Services • © 2026 DIH HUB</span>
              <button
                type="button"
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Close & Accept
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
