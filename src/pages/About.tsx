import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Zap, Globe, Users, Target, Shield, Rocket,
  TrendingUp, Award, Heart,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6 },
};

const timeline = [
  { year: "2019", title: "Founded", desc: "NEXUS COLLABS established in India with a vision to revolutionize digital services" },
  { year: "2020", title: "First 100 Workers", desc: "Built our initial network of vetted elite talent across 20 countries" },
  { year: "2021", title: "Global Expansion", desc: "Expanded to 50+ countries, delivering 5,000+ projects in our first full year" },
  { year: "2022", title: "Platform Launch", desc: "Launched our centralized agency platform with AI-powered talent matching" },
  { year: "2023", title: "4,000+ Workers", desc: "Reached 4,000+ approved workers and 20,000+ completed projects" },
  { year: "2024", title: "Industry Leader", desc: "Recognized as a leading global digital agency with 99% client satisfaction" },
];

const values = [
  { icon: Target, title: "Precision", desc: "Every project is matched with surgical accuracy to the perfect talent" },
  { icon: Shield, title: "Trust", desc: "Enterprise-grade security and NDAs protect every client relationship" },
  { icon: Rocket, title: "Velocity", desc: "Global 24/7 coverage means projects move at the speed of business" },
  { icon: Heart, title: "Excellence", desc: "We settle for nothing less than world-class deliverables every time" },
  { icon: Users, title: "Community", desc: "Our workers are partners, not contractors — invested in mutual success" },
  { icon: TrendingUp, title: "Growth", desc: "Continuous improvement drives better outcomes for clients and talent" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 section-padding">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/about-bg.jpg" alt="" className="w-full h-full object-cover opacity-20" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">About Us</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Redefining <span className="gradient-text">Digital Agency</span> Models
          </h1>
          <p className="text-[#999] max-w-2xl mx-auto text-base leading-relaxed">
            NEXUS COLLABS is not a freelancer marketplace. We are a centralized global
            digital agency that connects premium clients with elite, pre-vetted talent —
            handling every aspect of project management internally.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-20 section-padding bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Our <span className="gradient-text">Mission</span>
              </h2>
              <p className="text-[#999] leading-relaxed mb-4">
                We believe the future of work is centralized, curated, and premium.
                By removing the friction of freelancer marketplaces — vetting, negotiation,
                management, quality control — we deliver a white-glove agency experience
                at global scale.
              </p>
              <p className="text-[#999] leading-relaxed">
                Every client deserves world-class talent without the overhead of managing
                contractors. Every skilled worker deserves access to premium projects
                without the hustle of self-promotion. NEXUS bridges both worlds.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-8 neon-border">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Users, label: "4,000+", sub: "Elite Workers" },
                  { icon: Globe, label: "156", sub: "Countries" },
                  { icon: Zap, label: "28,500+", sub: "Projects Done" },
                  { icon: Award, label: "99%", sub: "Satisfaction" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon className="w-6 h-6 text-[#3b82f6] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.label}</p>
                    <p className="text-xs text-[#666]">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">Core Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold">What Drives Us</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="glass-panel rounded-xl p-6 card-hover">
                <div className="w-12 h-12 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-[#888]">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 section-padding bg-[#080808]">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold">Company Timeline</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#3b82f6] via-[#22d3ee] to-[#3b82f6] opacity-30" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.08 }}
                  className={`relative flex items-start gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className={`flex-1 ${i % 2 === 1 ? "md:text-right" : ""} pl-12 md:pl-0`}>
                    <div className="glass-panel rounded-xl p-5 relative">
                      <span className="absolute -left-12 md:left-auto md:-right-3 top-5 w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-xs font-bold neon-glow md:hidden">
                        {item.year.slice(2)}
                      </span>
                      <span className="hidden md:inline-block text-[#3b82f6] text-xs font-semibold mb-1">{item.year}</span>
                      <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-[#888]">{item.desc}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-3 h-3 rounded-full bg-[#3b82f6] border-4 border-[#080808] mt-6 flex-shrink-0 z-10" />
                  <div className={`hidden md:block flex-1 ${i % 2 === 1 ? "" : "text-right"}`}>
                    <span className="text-[#3b82f6] text-sm font-semibold mt-5 inline-block">{item.year}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 section-padding">
        <motion.div {...fadeInUp} className="glass-panel-strong rounded-2xl p-10 text-center max-w-2xl mx-auto neon-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join the NEXUS Network</h2>
          <p className="text-[#999] mb-6">Whether you need services or want to offer them — we&apos;re your gateway to global digital excellence.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/request" className="btn-glow px-8 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4" /> Request Service
            </Link>
            <Link to="/apply" className="px-8 py-3 rounded-xl text-sm font-semibold border border-[#333] text-white hover:border-[#3b82f6]/50 transition-all flex items-center gap-2">
              <Users className="w-4 h-4" /> Join As Worker
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
