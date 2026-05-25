import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import CountUp from "react-countup";
import {
  Zap,
  Globe,
  Shield,
  Cpu,
  Users,
  Rocket,
  ArrowRight,
  ChevronDown,
  Star,
  BarChart3,
  Headphones,
  Code2,
  Palette,
  Video,
  Smartphone,
  Search,
  Brain,
  Figma,
  PenTool,
  Megaphone,
  Database,
  Cloud,
  Lock as LockIcon,
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: "-100px" },
};

const stats = [
  { value: 4091, suffix: "+", label: "Elite Operatives", icon: Users },
  { value: 156, suffix: "", label: "Countries Served", icon: Globe },
  { value: 28500, suffix: "+", label: "Projects Delivered", icon: Rocket },
  { value: 99, suffix: "%", label: "Client Satisfaction", icon: Star },
];

const services = [
  { icon: Code2, label: "Web Development", desc: "Full-stack web apps & APIs" },
  { icon: Palette, label: "Graphic Design", desc: "Visual identity & branding" },
  { icon: Video, label: "Video Editing", desc: "Cinematic post-production" },
  { icon: Smartphone, label: "App Development", desc: "iOS & Android native apps" },
  { icon: Search, label: "SEO", desc: "Search engine optimization" },
  { icon: Figma, label: "UI/UX Design", desc: "User experience & interfaces" },
  { icon: Megaphone, label: "Social Media", desc: "Management & growth" },
  { icon: PenTool, label: "Copywriting", desc: "Persuasive content writing" },
  { icon: Brain, label: "AI Automation", desc: "ML models & AI solutions" },
  { icon: Database, label: "Data Analysis", desc: "Business intelligence" },
  { icon: Cloud, label: "Cloud Computing", desc: "AWS, Azure, GCP services" },
  { icon: LockIcon, label: "Cybersecurity", desc: "Security audits & pentesting" },
];

const workflowSteps = [
  { step: "01", title: "Client Submits Request", desc: "Project details entered through secure portal" },
  { step: "02", title: "Admin Reviews", desc: "Expert team evaluates requirements & scope" },
  { step: "03", title: "Worker Assigned", desc: "Best-match elite talent is hand-picked" },
  { step: "04", title: "Work Executed", desc: "Premium deliverables created with precision" },
  { step: "05", title: "Quality Review", desc: "Multi-layer quality assurance check" },
  { step: "06", title: "Delivery", desc: "Final product delivered to client" },
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "CTO, TechVenture Inc",
    text: "NEXUS COLLABS transformed our digital presence. The quality of work and speed of delivery is unmatched in the industry. A truly world-class agency.",
    image: "/talent-1.jpg",
  },
  {
    name: "Sarah Mitchell",
    role: "Marketing Director, GlobalBrand",
    text: "Working with NEXUS has been incredible. They assigned the perfect team for our campaign and the results exceeded every KPI we set.",
    image: "/talent-2.jpg",
  },
  {
    name: "Marcus Johnson",
    role: "Founder, StartupX",
    text: "The centralized approach is brilliant. No more vetting freelancers — NEXUS handles everything. Our app launched in half the expected time.",
    image: "/talent-3.jpg",
  },
];

const faqs = [
  {
    q: "How does the client request process work?",
    a: "Simply fill out the request form with your project details. Our admin team reviews your submission within 24 hours and assigns the best talent from our elite worker pool. You never have to vet or interview freelancers yourself.",
  },
  {
    q: "How are workers selected for my project?",
    a: "Our admin team manually reviews each project requirement and matches it with workers based on their skills, portfolio, experience level, and availability. We ensure the best possible fit for every project.",
  },
  {
    q: "What services does NEXUS offer?",
    a: "We offer 100+ digital services including web development, graphic design, video editing, app development, SEO, UI/UX design, AI automation, blockchain development, cloud computing, cybersecurity, and much more.",
  },
  {
    q: "How do I join as a worker?",
    a: "Fill out the worker application form with your skills and portfolio. Our team reviews each application manually. Approved workers gain access to premium projects from clients worldwide.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support Crypto, Payoneer, UPI, Bank Transfer, and PayPal. Clients can choose their preferred method during the request submission process.",
  },
];

function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="border border-[#222] rounded-lg overflow-hidden hover:border-[#3b82f6]/20 transition-colors duration-300"
    >
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#111] transition-colors"
      >
        <span className="text-sm font-medium text-white pr-4">{item.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-[#3b82f6] flex-shrink-0" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-[#888] leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hero-network.jpg"
            alt=""
            className="w-full h-full object-cover opacity-40"
            fetchPriority="low"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>

        {/* Floating particles overlay */}
        <div className="absolute inset-0 cyber-grid opacity-20" />

        {/* Content */}
        <div className="relative z-10 text-center section-padding max-w-5xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 mb-6 glow-pulse">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
              <span className="text-xs font-medium text-[#3b82f6] uppercase tracking-wider">
                Global Network Active
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Building The Future Of{" "}
            <span className="gradient-text">Global Digital Services</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-[#999] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A centralized worldwide agency ecosystem connecting premium clients
            with elite digital talent. No freelancer marketplaces — just
            precision-matched excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/request"
              className="btn-glow shimmer px-8 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Request Service
            </Link>
            <Link
              to="/apply"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-[#333] text-white hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4" />
              Join As Worker
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass-panel rounded-xl p-4 card-hover glow-pulse"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    <CountUp end={stat.value} duration={2.5} separator="," />
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-xs text-[#666] uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-[#3b82f6]" />
        </motion.div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="relative py-24 section-padding">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              100+ Digital <span className="gradient-text">Services</span>
            </h2>
            <p className="text-[#888] max-w-xl mx-auto">
              From web development to AI automation — we have elite talent for
              every digital need.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {services.map((service, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="glass-panel rounded-xl p-5 card-hover cursor-pointer group card-glow"
              >
                <div className="icon-float icon-float-delay-{(i % 4)}">
                  <service.icon className="w-8 h-8 text-[#3b82f6] mb-3 group-hover:text-[#22d3ee] transition-colors duration-300" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#22d3ee] transition-colors duration-300">
                  {service.label}
                </h3>
                <p className="text-xs text-[#666] group-hover:text-[#999] transition-colors duration-300">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeInUp} className="text-center mt-10">
            <motion.div whileHover={{ x: 4 }}>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm text-[#3b82f6] hover:text-[#22d3ee] link-glow transition-colors"
              >
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="relative py-24 bg-[#080808]">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="relative z-10 section-padding max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
              Why NEXUS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              The <span className="gradient-text">Advantage</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Vetted Elite Talent",
                desc: "Every worker undergoes rigorous skill assessment and portfolio review before joining our network. Only the top 5% are approved.",
              },
              {
                icon: Cpu,
                title: "Zero Client Management",
                desc: "Submit your request and relax. Our admin team handles all worker selection, project management, and quality assurance internally.",
              },
              {
                icon: Globe,
                title: "Global 24/7 Coverage",
                desc: "With talent across 156 countries, your project moves forward around the clock. No timezone delays, no communication gaps.",
              },
              {
                icon: LockIcon,
                title: "Enterprise Security",
                desc: "End-to-end encrypted file transfers, NDAs with all workers, and secure payment processing. Your IP is always protected.",
              },
              {
                icon: BarChart3,
                title: "Data-Driven Matching",
                desc: "Our proprietary matching system pairs your project with workers who have the exact skills and experience you need.",
              },
              {
                icon: Headphones,
                title: "Dedicated Support",
                desc: "Every client gets a dedicated account manager. Direct communication channel for updates, feedback, and priority handling.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -6 }}
                className="glass-panel rounded-xl p-6 card-hover card-glow group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/20 group-hover:border-[#3b82f6]/40 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-[#3b82f6] group-hover:text-[#22d3ee] transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#22d3ee] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-[#888] leading-relaxed group-hover:text-[#aaa] transition-colors duration-300">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section className="relative py-24 section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              The <span className="gradient-text">Process</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#3b82f6] via-[#22d3ee] to-[#3b82f6] opacity-30" />

            <div className="space-y-8">
              {workflowSteps.map((step, i) => (
                <motion.div
                  key={i}
                  {...fadeInUp}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-6 ${
                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -3 }}
                    className="flex-1 glass-panel rounded-xl p-6 relative group card-glow cursor-default"
                  >
                    <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#22d3ee] flex items-center justify-center text-sm font-bold text-white neon-glow">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 mt-2 group-hover:text-[#22d3ee] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#888] group-hover:text-[#aaa] transition-colors duration-300">{step.desc}</p>
                  </motion.div>
                  <motion.div
                    className="hidden md:flex w-4 h-4 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#22d3ee] border-4 border-[#0a0a0a] z-10 flex-shrink-0"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="relative py-24 bg-[#080808]">
        <div className="absolute inset-0 cyber-grid opacity-10" />
        <div className="relative z-10 section-padding max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Client <span className="gradient-text">Voices</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-panel rounded-xl p-6 card-hover card-glow group"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + s * 0.08 }}
                    >
                      <Star className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-[#ccc] leading-relaxed mb-6 group-hover:text-white transition-colors duration-300">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#333] group-hover:border-[#3b82f6]/50 transition-colors duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-[#22d3ee] transition-colors duration-300">{t.name}</p>
                    <p className="text-xs text-[#666]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative py-24 section-padding">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Common <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="space-y-3"
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <FAQItem item={faq} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 section-padding">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/network-nodes.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>
        <motion.div
          {...fadeInUp}
          className="relative z-10 gradient-border-animated rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">Get Started?</span>
          </h2>
          <p className="text-[#999] mb-8 max-w-lg mx-auto">
            Whether you need premium digital services or want to join our elite
            talent network — NEXUS COLLABS is your gateway to excellence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/request"
              className="btn-glow shimmer px-8 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Request Service
            </Link>
            <Link
              to="/apply"
              className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-[#333] text-white hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4" />
              Join As Worker
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
