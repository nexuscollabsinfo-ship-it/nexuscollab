import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Mail, Phone, MapPin, Send, ArrowLeft,
  MessageSquare, Clock, Globe, Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#3b82f6] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Info */}
            <motion.div {...fadeInUp}>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">Contact</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="text-[#999] mb-8 leading-relaxed">
                Have questions about our services? Want to discuss a custom project?
                Our team is ready to help you navigate the NEXUS ecosystem.
              </p>

              <div className="space-y-6 mb-10">
                {[
                  { icon: Mail, label: "Email", value: "nexuscollabs.info@gmail.com" },
                  { icon: Phone, label: "Phone", value: "+91 8448179299" },
                  { icon: MapPin, label: "Location", value: "India" },
                  { icon: Clock, label: "Hours", value: "24/7 Global Support" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#666] uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/request" className="flex items-center gap-3 p-3 rounded-lg bg-[#111] hover:bg-[#3b82f6]/10 transition-colors group">
                    <Zap className="w-4 h-4 text-[#3b82f6]" />
                    <span className="text-sm text-white">Submit a project request</span>
                  </Link>
                  <Link to="/apply" className="flex items-center gap-3 p-3 rounded-lg bg-[#111] hover:bg-[#22d3ee]/10 transition-colors group">
                    <Globe className="w-4 h-4 text-[#22d3ee]" />
                    <span className="text-sm text-white">Apply to join as worker</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
              {submitted ? (
                <div className="glass-panel-strong rounded-2xl p-10 text-center neon-border">
                  <MessageSquare className="w-12 h-12 text-[#22d3ee] mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-sm text-[#999]">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#999] mb-1.5">Full Name</label>
                      <input type="text" className="input-field" placeholder="John Doe" required />
                    </div>
                    <div>
                      <label className="block text-xs text-[#999] mb-1.5">Email</label>
                      <input type="email" className="input-field" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5">Subject</label>
                    <input type="text" className="input-field" placeholder="How can we help?" required />
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5">Message</label>
                    <textarea className="input-field min-h-[150px] resize-y" placeholder="Tell us about your inquiry..." required />
                  </div>
                  <button type="submit" className="btn-glow w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
