import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, ShieldCheck, FileText, Mail, ExternalLink, CheckCircle, Info, Lock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type LegalTab = 'terms' | 'privacy' | 'disclaimer';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export default function LegalModal({ isOpen, initialTab = 'terms', onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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
          <div className="px-6 py-4.5 border-b border-[#1e2336] bg-[#141722]/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                {activeTab === 'terms' && <FileText size={18} className="text-emerald-400" />}
                {activeTab === 'privacy' && <ShieldCheck size={18} className="text-blue-400" />}
                {activeTab === 'disclaimer' && <ShieldAlert size={18} className="text-amber-400" />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                  <span>DIH HUB Legal Compliance</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    v2.4 (2026)
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
              onClick={() => setActiveTab('terms')}
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
              onClick={() => setActiveTab('privacy')}
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
              onClick={() => setActiveTab('disclaimer')}
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
                    <h4 className="font-bold text-emerald-200 text-sm">Agreement to Terms</h4>
                    <p className="text-[11px] text-emerald-300/90 mt-1">
                      By accessing, browsing, registering an account, depositing funds, or using any digital service or tool provided by DIH Hub (&ldquo;dihhub.site&rdquo;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    1. Account Registration & Security
                  </h4>
                  <p className="text-slate-300">
                    To access certain advanced utilities (including DIH SMM, APK Store, and Wallet management), users may create an account. You are solely responsible for maintaining the confidentiality of your credentials, password, and active sessions. Any activity conducted under your account is your sole legal and operational responsibility.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    2. Wallet, Deposits & Payment Terms
                  </h4>
                  <p className="text-slate-300">
                    DIH Hub provides multiple payment channels, including automated checkout partners (such as Paynicorn, UPI, local mobile wallets, and cards) and manual payment rails.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>All deposited balances are credited directly to your internal DIH Hub balance in USD or converted local currency.</li>
                    <li>Funds loaded into your account balance are intended solely for ordering services and utilities on the platform.</li>
                    <li>Chargebacks, payment fraud, or disputes opened without first contacting DIH Hub support will result in immediate and permanent account termination, along with blacklisting of associated payment credentials.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    3. Digital Services & SMM Order Fulfillment
                  </h4>
                  <p className="text-slate-300">
                    DIH Hub provides automated social media marketing (SMM) and digital promotional utilities:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Link & Quantity Accuracy:</strong> Users are solely responsible for providing public, correct URLs and valid links. Orders placed with private accounts or invalid URLs cannot be modified once processing starts.</li>
                    <li><strong>Delivery Times:</strong> Delivery speeds and start times displayed on service descriptions are estimates provided by provider networks and may vary depending on platform queue volumes.</li>
                    <li><strong>Refill & Guarantee:</strong> Services marked with refill badges (e.g., 30D Refill) qualify for replenishment if drop counts fall within the provider refill terms. Services marked &ldquo;No Refill&rdquo; do not qualify for replenishment.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    4. Cancellation & Refund Policy
                  </h4>
                  <p className="text-slate-300">
                    Due to the instantaneous and automated nature of digital API order dispatch:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Orders that are &ldquo;In Progress&rdquo; or &ldquo;Processing&rdquo; cannot be cancelled manually by users.</li>
                    <li>If an order is cancelled or partially fulfilled by the provider network, the unfulfilled portion is automatically refunded back to your <strong>DIH Hub wallet balance</strong>.</li>
                    <li>Direct gateway refunds to external bank cards or mobile wallets are only granted in exceptional cases where technical failure prevented balance crediting.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    5. Prohibited Conduct & Acceptable Use
                  </h4>
                  <p className="text-slate-300">
                    Users shall not use DIH Hub for:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Targeting accounts or links containing illegal, defamatory, terroristic, or fraudulent content.</li>
                    <li>Conducting denial-of-service (DoS) attacks, brute-forcing API endpoints, or exploiting web application vulnerabilities.</li>
                    <li>Reverse-engineering proprietary code, binary packers, or client-side assets without express written consent.</li>
                  </ul>
                </section>
              </div>
            )}

            {/* PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-300 flex items-start gap-3">
                  <Lock size={16} className="shrink-0 mt-0.5 text-blue-400" />
                  <div>
                    <h4 className="font-bold text-blue-200 text-sm">Privacy & Data Protection Commitment</h4>
                    <p className="text-[11px] text-blue-300/90 mt-1">
                      DIH Hub respects your privacy and is committed to protecting your personal data. This Privacy Policy details how we collect, process, safeguard, and manage your data when using our website and digital tools.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    1. Information We Collect
                  </h4>
                  <p className="text-slate-300">
                    We collect only the minimum required information necessary to provide seamless services:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li><strong>Account Information:</strong> Email address, chosen username, and encrypted authentication tokens.</li>
                    <li><strong>Order & Transaction Records:</strong> Service ID, target URL/username, order quantities, payment transaction IDs (TXN), and account balance history.</li>
                    <li><strong>Technical Logs:</strong> IP address, browser type, device information, and diagnostic timestamps for session management and anti-fraud protection.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    2. How We Use Your Information
                  </h4>
                  <p className="text-slate-300">
                    Your data is strictly utilized for:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300">
                    <li>Processing and dispatching your orders through authenticated digital provider APIs.</li>
                    <li>Verifying and crediting deposits made via authorized payment processors.</li>
                    <li>Providing technical customer support and resolving delivery issues.</li>
                    <li>Maintaining platform security, mitigating automated bot attacks, and preventing fraudulent transactions.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    3. Payment Data & Third-Party Processors
                  </h4>
                  <p className="text-slate-300">
                    DIH Hub does <strong>NOT</strong> store sensitive credit card numbers, CVVs, or bank PINs on its servers. All payment transactions are handled through PCI-compliant automated payment gateways (e.g., Paynicorn, UPI rails, or banking partners). Our servers only receive cryptographically signed transaction status callbacks to confirm deposit amounts.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    4. Zero Data Selling & Third-Party Sharing
                  </h4>
                  <p className="text-slate-300">
                    We strictly uphold a <strong>Zero-Sale Policy</strong>. We do not sell, rent, or lease your personal information, email addresses, or transaction histories to third-party advertisers, data brokers, or marketing networks.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    5. Cookies & Local Storage
                  </h4>
                  <p className="text-slate-300">
                    DIH Hub utilizes browser cookies and local storage exclusively for session persistence, remembering your theme preferences, active tools, and cached service catalogs for instantaneous load times.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    6. User Rights & Data Deletion
                  </h4>
                  <p className="text-slate-300">
                    You have the right to request a summary of your stored personal data, request corrections, or request complete account and transaction log deletion by emailing us at <a href="mailto:contact@dihhub.site" className="text-blue-400 underline font-semibold">contact@dihhub.site</a>.
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
                      Please review the operational boundaries, trademark acknowledgments, and fair use policies governing the DIH Hub platform.
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
                    Any third-party trademarks, logos, brand names, or service names mentioned on DIH Hub (including but not limited to Instagram, Facebook, TikTok, YouTube, Telegram, Twitter/X, Spotify, Discord, PhonePe, Paytm, or Google) are the registered property of their respective trademark holders.
                  </p>
                  <p className="text-slate-300">
                    DIH Hub is an independent platform and is not affiliated with, sponsored by, endorsed by, or in partnership with any of these third-party corporations.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    3. &ldquo;As-Is&rdquo; Service Warranty Disclaimer
                  </h4>
                  <p className="text-slate-300">
                    Services, API connections, and digital utilities are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, either express or implied, including fitness for a particular purpose or continuous uptime without provider maintenance interruptions.
                  </p>
                </section>

                <section className="space-y-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    4. Limitation of Liability
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
              <span>Questions? Email:</span>
              <a 
                href="mailto:contact@dihhub.site" 
                className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-dotted"
              >
                contact@dihhub.site
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">© 2026 DIH Hub Official</span>
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
