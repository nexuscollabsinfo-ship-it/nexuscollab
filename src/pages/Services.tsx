import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { serviceCategories, serviceStats } from "@/lib/servicesData";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Code2, Palette, Megaphone, Brain, PenTool, Video, Briefcase, Server, BarChart3, Sparkles, ArrowRight, Zap, Search, X } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.05 } },
  viewport: { once: true, margin: "-50px" },
};

const iconMap: Record<string, React.ElementType> = {
  Code2, Palette, Megaphone, Brain, PenTool, Video, Briefcase, Server, BarChart3, Sparkles,
};

export default function Services() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = serviceCategories
    .map(cat => ({
      ...cat,
      skills: cat.skills.filter(s => {
        const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "all" || cat.id === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    }))
    .filter(cat => cat.skills.length > 0);

  const totalFiltered = filtered.reduce((sum, c) => sum + c.skills.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 section-padding">
        <div className="absolute inset-0 overflow-hidden">
          <img src="/services-bg.jpg" alt="" className="w-full h-full object-cover opacity-20" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 to-[#0a0a0a]" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-5xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3b82f6] mb-4 block">
            What We Offer
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">{serviceStats.total}+</span> Premium Services
          </h1>
          <p className="text-[#999] max-w-2xl mx-auto mb-8">
            Access our complete catalog of professional digital services.
            Each project is matched with vetted elite talent from our global network.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-8 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#3b82f6]/50 transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeCategory === "all" ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30" : "text-[#666] hover:text-white border border-[#222]"
              }`}
            >
              All ({serviceStats.total})
            </button>
            {serviceCategories.map(cat => {
              const Icon = iconMap[cat.icon] || Code2;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border"
                  style={
                    activeCategory === cat.id
                      ? { background: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }
                      : { color: "#666", borderColor: "#222" }
                  }
                >
                  <Icon className="w-3 h-3" />
                  {cat.title}
                </button>
              );
            })}
          </div>

          {search && (
            <p className="text-sm text-[#666] mt-4">
              {totalFiltered} result{totalFiltered !== 1 ? "s" : ""} for &quot;{search}&quot;
            </p>
          )}

          <Link to="/request" className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white mt-8">
            <Zap className="w-4 h-4" />
            Request a Service
          </Link>
        </motion.div>
      </section>

      {/* Service Categories */}
      {filtered.map((category, ci) => {
        const Icon = iconMap[category.icon] || Code2;
        return (
          <section key={category.id} className={`py-16 section-padding ${ci % 2 === 1 ? "bg-[#080808]" : ""}`}>
            <div className="max-w-7xl mx-auto">
              <motion.div {...fadeInUp} className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.color}15`, border: `1px solid ${category.color}30` }}>
                  <Icon className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">{category.title}</h2>
                <span className="text-xs text-[#666] ml-2">({category.skills.length})</span>
              </motion.div>

              <motion.div variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {category.skills.map((service, si) => (
                  <motion.div key={si} variants={fadeInUp} className="glass-panel rounded-lg p-4 card-hover cursor-pointer group card-glow">
                    <h3 className="text-sm font-medium text-white mb-0.5 group-hover:text-[#22d3ee] transition-colors">{service.name}</h3>
                    <p className="text-xs text-[#666]">{service.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-[#666]">No services found matching your search.</p>
        </div>
      )}

      {/* CTA */}
      <section className="py-24 section-padding">
        <motion.div {...fadeInUp} className="glass-panel-strong rounded-2xl p-10 text-center max-w-2xl mx-auto neon-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-[#999] mb-6">
            Can&apos;t find what you&apos;re looking for? Submit a request and our team will find the perfect talent.
          </p>
          <Link to="/request" className="btn-glow inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white">
            Submit Request <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
