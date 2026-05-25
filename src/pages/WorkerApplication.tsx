import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Send, CheckCircle, ArrowLeft, User, Mail, Phone, MapPin,
  Globe, DollarSign, Clock, AlertCircle, Home, Loader2,
  MessageSquare, Briefcase,
} from "lucide-react";
import { FileUpload, type UploadedFile } from "@/components/FileUpload";
import { SkillSelector } from "@/components/SkillSelector";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const workTypes = [
  { value: "part_time" as const, label: "Part-time" },
  { value: "full_time" as const, label: "Full-time" },
];

const paymentOptions = ["Crypto", "Payoneer", "UPI", "Bank Transfer", "PayPal", "Other"];
const skillLevels = ["beginner", "intermediate", "advanced", "expert"] as const;
const deliveryOptions = ["Under 24 hours", "1-3 days", "3-7 days", "1-2 weeks", "2-4 weeks", "1+ months"];

interface PortfolioEntry {
  skillName: string;
  uploadedFiles: UploadedFile[];
  softwareTools: string;
  experienceDetails: string;
  yearsOfExperience: string;
  skillLevel: string;
}

export default function WorkerApplication() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", discordUsername: "",
    instagramUsername: "", country: "", workType: "" as "part_time" | "full_time" | "",
    skills: [] as string[], minPrice: "", maxPrice: "",
    deliveryTime: "", paymentMethods: [] as string[],
  });
  const [portfolios, setPortfolios] = useState<PortfolioEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = trpc.workerApplication.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (err) => {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const isSubmitting = submitMutation.isPending;

  const hasData = !!(formData.fullName || formData.email || formData.phone || formData.country ||
    formData.skills.length > 0 || formData.workType || formData.minPrice || formData.maxPrice);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasData && !submitted) { e.preventDefault(); e.returnValue = ""; }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasData, submitted]);

  const handleSkillsChange = useCallback((skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
    setErrors(prev => ({ ...prev, skills: "" }));
    setPortfolios(prev => {
      const kept = prev.filter(p => skills.includes(p.skillName));
      const existingNames = new Set(kept.map(p => p.skillName));
      const newEntries = skills
        .filter(s => !existingNames.has(s))
        .map(skillName => ({
          skillName,
          uploadedFiles: [] as UploadedFile[],
          softwareTools: "",
          experienceDetails: "",
          yearsOfExperience: "",
          skillLevel: "",
        }));
      return [...kept, ...newEntries];
    });
  }, []);

  function updatePortfolio(index: number, field: keyof PortfolioEntry, value: string | UploadedFile[]) {
    setPortfolios(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim() || /^\S+@\S+\.\S+$/.test(formData.email) === false) newErrors.email = "Please enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.workType) newErrors.workType = "Please select work type";
    if (formData.skills.length === 0) newErrors.skills = "Please select at least one skill";
    if (!formData.minPrice || Number(formData.minPrice) <= 0) newErrors.minPrice = "Minimum price is required";
    if (!formData.maxPrice || Number(formData.maxPrice) <= 0) newErrors.maxPrice = "Maximum price is required";
    if (formData.maxPrice && formData.minPrice && Number(formData.maxPrice) < Number(formData.minPrice)) {
      newErrors.maxPrice = "Max price must be greater than min price";
    }
    if (!formData.deliveryTime) newErrors.deliveryTime = "Please select delivery time";
    if (formData.paymentMethods.length === 0) newErrors.paymentMethods = "Please select at least one payment method";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    submitMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      discordUsername: formData.discordUsername || undefined,
      instagramUsername: formData.instagramUsername || undefined,
      country: formData.country,
      workType: formData.workType as "part_time" | "full_time",
      skills: formData.skills,
      minPrice: Number(formData.minPrice),
      maxPrice: Number(formData.maxPrice),
      deliveryTime: formData.deliveryTime,
      paymentMethods: formData.paymentMethods,
      portfolios: portfolios.map(p => ({
        skillName: p.skillName,
        portfolioFiles: p.uploadedFiles.map(f => f.url),
        softwareTools: p.softwareTools ? p.softwareTools.split(",").map(s => s.trim()).filter(Boolean) : [],
        experienceDetails: p.experienceDetails || undefined,
        yearsOfExperience: p.yearsOfExperience ? Number(p.yearsOfExperience) : undefined,
        skillLevel: (p.skillLevel as "beginner" | "intermediate" | "advanced" | "expert") || undefined,
      })),
    });
  }

  function goBack() {
    if (hasData && !submitted) {
      if (!window.confirm("You have unsaved changes. Go back anyway?")) return;
    }
    window.location.href = "/";
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-16 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-panel-strong rounded-2xl p-8 sm:p-12 max-w-md mx-auto neon-border">
            <CheckCircle className="w-16 h-16 text-[#22d3ee] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-[#999] mb-1">Our team will review your application within 48 hours.</p>
            <p className="text-[#666] text-sm mb-8">Check the admin dashboard to view all applications.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={() => { window.location.href = "/"; }}
                className="btn-glow w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Go Home
              </button>
              <button type="button" onClick={() => { window.location.reload(); }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold border border-[#333] text-white hover:border-[#3b82f6]/50 transition-all">
                Submit Another
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const inputClass = (field: string) =>
    `input-field ${errors[field] ? "border-red-500/50 ring-1 ring-red-500/20" : ""}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button type="button" onClick={goBack}
              className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#3b82f6] mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#22d3ee]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Join as <span className="gradient-text">Elite Worker</span></h1>
            </div>
            <p className="text-[#999] mb-8 text-sm">Apply to join our global talent network. Approved workers get access to premium projects worldwide.</p>
          </motion.div>

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Please fix the errors below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><User className="w-3 h-3 inline mr-1" /> Full Name *</label>
                  <input type="text" value={formData.fullName}
                    onChange={e => { setFormData(p => ({ ...p, fullName: e.target.value })); if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" })); }}
                    className={inputClass("fullName")} placeholder="John Doe" />
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Mail className="w-3 h-3 inline mr-1" /> Email *</label>
                  <input type="email" value={formData.email}
                    onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors(prev => ({ ...prev, email: "" })); }}
                    className={inputClass("email")} placeholder="john@example.com" />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Phone className="w-3 h-3 inline mr-1" /> Phone *</label>
                  <input type="tel" value={formData.phone}
                    onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); if (errors.phone) setErrors(prev => ({ ...prev, phone: "" })); }}
                    className={inputClass("phone")} placeholder="+91 8448179299" />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><MapPin className="w-3 h-3 inline mr-1" /> Country *</label>
                  <input type="text" value={formData.country}
                    onChange={e => { setFormData(p => ({ ...p, country: e.target.value })); if (errors.country) setErrors(prev => ({ ...prev, country: "" })); }}
                    className={inputClass("country")} placeholder="India" />
                  {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><MessageSquare className="w-3 h-3 inline mr-1" /> Discord</label>
                  <input type="text" value={formData.discordUsername}
                    onChange={e => setFormData(p => ({ ...p, discordUsername: e.target.value }))}
                    className="input-field" placeholder="username#0000" />
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Globe className="w-3 h-3 inline mr-1" /> Instagram</label>
                  <input type="text" value={formData.instagramUsername}
                    onChange={e => setFormData(p => ({ ...p, instagramUsername: e.target.value }))}
                    className="input-field" placeholder="@username" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">Work Preferences</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-[#999] mb-2">Work Type *</label>
                  <div className="flex gap-3">
                    {workTypes.map(wt => (
                      <button key={wt.value} type="button"
                        onClick={() => { setFormData(p => ({ ...p, workType: wt.value })); if (errors.workType) setErrors(prev => ({ ...prev, workType: "" })); }}
                        className={`px-5 py-2.5 rounded-lg text-sm border transition-all ${
                          formData.workType === wt.value ? "bg-[#3b82f6]/20 border-[#3b82f6]/50 text-[#3b82f6]" : "bg-[#111] border-[#222] text-[#999] hover:border-[#333]"
                        }`}>
                        {wt.label}
                      </button>
                    ))}
                  </div>
                  {errors.workType && <p className="text-xs text-red-400 mt-1">{errors.workType}</p>}
                </div>

                <div>
                  <label className="block text-xs text-[#999] mb-2">Skills *</label>
                  <SkillSelector selected={formData.skills} onChange={handleSkillsChange} error={errors.skills} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><DollarSign className="w-3 h-3 inline mr-1" /> Min Price (USD) *</label>
                    <input type="number" value={formData.minPrice}
                      onChange={e => { setFormData(p => ({ ...p, minPrice: e.target.value })); if (errors.minPrice) setErrors(prev => ({ ...prev, minPrice: "" })); }}
                      className={inputClass("minPrice")} placeholder="100" min={0} />
                    {errors.minPrice && <p className="text-xs text-red-400 mt-1">{errors.minPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><DollarSign className="w-3 h-3 inline mr-1" /> Max Price (USD) *</label>
                    <input type="number" value={formData.maxPrice}
                      onChange={e => { setFormData(p => ({ ...p, maxPrice: e.target.value })); if (errors.maxPrice) setErrors(prev => ({ ...prev, maxPrice: "" })); }}
                      className={inputClass("maxPrice")} placeholder="1000" min={0} />
                    {errors.maxPrice && <p className="text-xs text-red-400 mt-1">{errors.maxPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><Clock className="w-3 h-3 inline mr-1" /> Delivery Time *</label>
                    <select value={formData.deliveryTime}
                      onChange={e => { setFormData(p => ({ ...p, deliveryTime: e.target.value })); if (errors.deliveryTime) setErrors(prev => ({ ...prev, deliveryTime: "" })); }}
                      className={inputClass("deliveryTime")}>
                      <option value="">Select</option>
                      {deliveryOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.deliveryTime && <p className="text-xs text-red-400 mt-1">{errors.deliveryTime}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#999] mb-2">Payment Methods *</label>
                  <div className="flex flex-wrap gap-2">
                    {paymentOptions.map(pm => (
                      <button key={pm} type="button"
                        onClick={() => {
                          setFormData(p => ({ ...p, paymentMethods: p.paymentMethods.includes(pm) ? p.paymentMethods.filter(x => x !== pm) : [...p.paymentMethods, pm] }));
                          if (errors.paymentMethods) setErrors(prev => ({ ...prev, paymentMethods: "" }));
                        }}
                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                          formData.paymentMethods.includes(pm) ? "bg-[#3b82f6]/20 border-[#3b82f6]/50 text-[#3b82f6]" : "bg-[#111] border-[#222] text-[#999]"
                        }`}>
                        {pm}
                      </button>
                    ))}
                  </div>
                  {errors.paymentMethods && <p className="text-xs text-red-400 mt-1">{errors.paymentMethods}</p>}
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {portfolios.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#22d3ee] mb-4">
                    Portfolio Sections ({portfolios.length})
                  </h3>
                  <div className="space-y-4">
                    {portfolios.map((portfolio, index) => (
                      <motion.div key={portfolio.skillName}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                        className="glass-panel rounded-xl p-6 neon-border">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                          <h4 className="text-base font-semibold text-white">{portfolio.skillName}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-[#999] mb-1.5">Software / Tools</label>
                            <input type="text" value={portfolio.softwareTools}
                              onChange={e => updatePortfolio(index, "softwareTools", e.target.value)}
                              className="input-field" placeholder="e.g. Photoshop, Figma, After Effects" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#999] mb-1.5">Years of Experience</label>
                            <input type="number" value={portfolio.yearsOfExperience}
                              onChange={e => updatePortfolio(index, "yearsOfExperience", e.target.value)}
                              className="input-field" placeholder="3" min={0} max={50} />
                          </div>
                          <div>
                            <label className="block text-xs text-[#999] mb-1.5">Skill Level</label>
                            <select value={portfolio.skillLevel}
                              onChange={e => updatePortfolio(index, "skillLevel", e.target.value)}
                              className="input-field">
                              <option value="">Select level</option>
                              {skillLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs text-[#999] mb-1.5">Experience Details</label>
                            <textarea value={portfolio.experienceDetails}
                              onChange={e => updatePortfolio(index, "experienceDetails", e.target.value)}
                              className="input-field min-h-[80px] resize-y" placeholder="Describe your relevant experience with this skill..." />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs text-[#999] mb-1.5">Portfolio Files / Samples (Max 5)</label>
                            <FileUpload
                              onUpload={(fileList) => updatePortfolio(index, "uploadedFiles", fileList)}
                              uploadedFiles={portfolio.uploadedFiles}
                              maxFiles={5}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <button type="submit" disabled={isSubmitting}
                className="btn-glow w-full py-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Application</>}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
