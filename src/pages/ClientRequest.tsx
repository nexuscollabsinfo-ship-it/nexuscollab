import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { allServiceNames } from "@/lib/servicesData";
import { toast } from "sonner";
import {
  Send, CheckCircle, ArrowLeft, Zap, Globe,
  DollarSign, Calendar, CreditCard, User, Mail, Phone,
  MapPin, MessageSquare, FileText, AlertCircle, Home, Loader2,
} from "lucide-react";
import { FileUpload, type UploadedFile } from "@/components/FileUpload";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const leadSources = ["Google", "Discord", "Instagram", "Facebook", "Staff Member", "Other"];
const budgetRanges = ["Under $500", "$500 - $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000+", "Custom"];
const deadlines = ["ASAP", "1 Week", "2 Weeks", "1 Month", "2 Months", "Flexible"];
const paymentMethods = ["Crypto", "Payoneer", "UPI", "Bank Transfer", "PayPal", "Other"];
const serviceOptions = [...allServiceNames, "Other"];

export default function ClientRequest() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", discordUsername: "",
    instagramUsername: "", country: "", leadSource: "",
    serviceNeeded: "", projectDetails: "", budgetRange: "",
    deadline: "", paymentMethod: "",
  });
  const [customService, setCustomService] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = trpc.clientRequest.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Request submitted successfully!");
    },
    onError: (err) => {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit. Please try again.");
    },
  });

  const isSubmitting = createMutation.isPending;

  const hasData = !!(formData.fullName || formData.email || formData.phone || formData.country ||
    formData.serviceNeeded || formData.projectDetails);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasData && !submitted) { e.preventDefault(); e.returnValue = ""; }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasData, submitted]);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.leadSource) newErrors.leadSource = "Please select how you heard about us";
    if (!formData.serviceNeeded) newErrors.serviceNeeded = "Please select a service";
    if (formData.serviceNeeded === "Other" && !customService.trim()) newErrors.serviceNeeded = "Please specify your custom service";
    if (!formData.projectDetails.trim() || formData.projectDetails.length < 10) newErrors.projectDetails = "Please provide at least 10 characters describing your project";
    if (!formData.budgetRange) newErrors.budgetRange = "Please select a budget range";
    if (!formData.deadline) newErrors.deadline = "Please select a deadline";
    if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method";
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

    const fileUrls = uploadedFiles.map(f => f.url);
    const serviceValue = formData.serviceNeeded === "Other" && customService.trim()
      ? customService.trim()
      : formData.serviceNeeded;

    createMutation.mutate({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone || undefined,
      discordUsername: formData.discordUsername || undefined,
      instagramUsername: formData.instagramUsername || undefined,
      country: formData.country,
      leadSource: formData.leadSource,
      serviceNeeded: serviceValue,
      projectDetails: formData.projectDetails,
      budgetRange: formData.budgetRange,
      deadline: formData.deadline,
      paymentMethod: formData.paymentMethod,
      referenceFiles: fileUrls,
    });
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  }

  function confirmNavigate(href: string) {
    if (hasData && !submitted) {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
    }
    window.location.href = href;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-16 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-panel-strong rounded-2xl p-8 sm:p-12 max-w-md mx-auto neon-border">
            <CheckCircle className="w-16 h-16 text-[#22d3ee] mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
            <p className="text-[#999] mb-1">Our team will review your request within 24 hours.</p>
            <p className="text-[#666] text-sm mb-8">Check the admin dashboard to view all submissions.</p>
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
            <button type="button" onClick={() => confirmNavigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#3b82f6] mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Submit Your <span className="gradient-text">Project Request</span></h1>
            </div>
            <p className="text-[#999] mb-8 text-sm">Fill out the form below. Our admin team will review and match your project with the best talent.</p>
          </motion.div>

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Please fix the errors below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><User className="w-3 h-3 inline mr-1" /> Full Name *</label>
                  <input type="text" value={formData.fullName} onChange={e => updateField("fullName", e.target.value)} className={inputClass("fullName")} placeholder="John Doe" />
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Mail className="w-3 h-3 inline mr-1" /> Email *</label>
                  <input type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} className={inputClass("email")} placeholder="john@example.com" />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Phone className="w-3 h-3 inline mr-1" /> Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} className="input-field" placeholder="+91 8448179299" />
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><MapPin className="w-3 h-3 inline mr-1" /> Country *</label>
                  <input type="text" value={formData.country} onChange={e => updateField("country", e.target.value)} className={inputClass("country")} placeholder="India" />
                  {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><MessageSquare className="w-3 h-3 inline mr-1" /> Discord</label>
                  <input type="text" value={formData.discordUsername} onChange={e => updateField("discordUsername", e.target.value)} className="input-field" placeholder="username#0000" />
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Globe className="w-3 h-3 inline mr-1" /> Instagram</label>
                  <input type="text" value={formData.instagramUsername} onChange={e => updateField("instagramUsername", e.target.value)} className="input-field" placeholder="@username" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><Zap className="w-3 h-3 inline mr-1" /> Which service do you need? *</label>
                  <select value={formData.serviceNeeded} onChange={e => { updateField("serviceNeeded", e.target.value); if (e.target.value !== "Other") setCustomService(""); }} className={inputClass("serviceNeeded")}>
                    <option value="">Select a service</option>
                    {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.serviceNeeded && <p className="text-xs text-red-400 mt-1">{errors.serviceNeeded}</p>}

                  <AnimatePresence>
                    {formData.serviceNeeded === "Other" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                        <input type="text" value={customService} onChange={e => setCustomService(e.target.value)}
                          placeholder="Please specify your service..." className="input-field" style={{ borderColor: "rgba(245,158,11,0.4)" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <label className="block text-xs text-[#999] mb-1.5"><FileText className="w-3 h-3 inline mr-1" /> Project Details *</label>
                  <textarea value={formData.projectDetails} onChange={e => updateField("projectDetails", e.target.value)}
                    className={`${inputClass("projectDetails")} min-h-[120px] resize-y`} placeholder="Describe your project in detail..." />
                  {errors.projectDetails && <p className="text-xs text-red-400 mt-1">{errors.projectDetails}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><DollarSign className="w-3 h-3 inline mr-1" /> Budget Range *</label>
                    <select value={formData.budgetRange} onChange={e => updateField("budgetRange", e.target.value)} className={inputClass("budgetRange")}>
                      <option value="">Select</option>
                      {budgetRanges.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.budgetRange && <p className="text-xs text-red-400 mt-1">{errors.budgetRange}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><Calendar className="w-3 h-3 inline mr-1" /> Deadline *</label>
                    <select value={formData.deadline} onChange={e => updateField("deadline", e.target.value)} className={inputClass("deadline")}>
                      <option value="">Select</option>
                      {deadlines.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.deadline && <p className="text-xs text-red-400 mt-1">{errors.deadline}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[#999] mb-1.5"><CreditCard className="w-3 h-3 inline mr-1" /> Payment Method *</label>
                    <select value={formData.paymentMethod} onChange={e => updateField("paymentMethod", e.target.value)} className={inputClass("paymentMethod")}>
                      <option value="">Select</option>
                      {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.paymentMethod && <p className="text-xs text-red-400 mt-1">{errors.paymentMethod}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">How did you hear about us? *</h3>
              <div className="flex flex-wrap gap-2">
                {leadSources.map(source => (
                  <button key={source} type="button" onClick={() => updateField("leadSource", source)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                      formData.leadSource === source ? "bg-[#3b82f6]/20 border-[#3b82f6]/50 text-[#3b82f6]" : "bg-[#111] border-[#222] text-[#999] hover:border-[#333]"
                    }`}>
                    {source}
                  </button>
                ))}
              </div>
              {errors.leadSource && <p className="text-xs text-red-400 mt-2">{errors.leadSource}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-panel rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3b82f6] mb-4">Reference Files (Max 5)</h3>
              <FileUpload onUpload={setUploadedFiles} uploadedFiles={uploadedFiles} maxFiles={5} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button type="submit" disabled={isSubmitting}
                className="btn-glow w-full py-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Request</>}
              </button>
            </motion.div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
