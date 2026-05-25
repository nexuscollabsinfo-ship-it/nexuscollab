import { Link } from "react-router";
import { Github, Twitter, Linkedin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-[#222] bg-[#0a0a0a]">
      {/* Cyber grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/nexus-logo.png" alt="NEXUSCOLLABS" className="h-8 w-auto object-contain rounded" />
            </Link>
            <p className="text-sm text-[#666] leading-relaxed">
              A centralized worldwide digital service agency ecosystem connecting
              premium clients with elite digital talent across the globe.
            </p>
            <div className="flex items-center gap-4">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="social-icon-btn w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#666]"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Services", path: "/services" },
                { label: "Request Service", path: "/request" },
                { label: "Join as Worker", path: "/apply" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-[#666] link-glow hover:text-[#3b82f6]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                "Web Development",
                "UI/UX Design",
                "AI Automation",
                "Mobile Apps",
                "Blockchain",
                "Cloud Computing",
                "Cybersecurity",
                "Data Science",
              ].map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-sm text-[#666] link-glow hover:text-[#3b82f6]"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-[#666]">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[#999]">nexuscollabs.info@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#22d3ee]" />
                <span className="text-[#999]">+91 8448179299</span>
              </li>
              <li className="pt-2 text-xs text-[#555]">
                Global Headquarters
                <br />
                India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#555]">
            &copy; {new Date().getFullYear()} NEXUS COLLABS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[#555]">
            <button className="hover:text-[#3b82f6] link-glow">Privacy</button>
            <button className="hover:text-[#3b82f6] link-glow">Terms</button>
            <button className="hover:text-[#3b82f6] link-glow">Security</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
