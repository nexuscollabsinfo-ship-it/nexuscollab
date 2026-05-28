import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Briefcase, Activity as ActivityIcon,
  ArrowLeft, Zap, CheckCircle, Clock, Trash2, UserX,
  Settings, FolderOpen, Lock, Eye, EyeOff,
  Mail, Phone, ChevronDown, ChevronUp, RefreshCw, Inbox,
  Database, Loader2,
} from "lucide-react";

const ADMIN_PASSWORD = "123456789";

type Tab = "overview" | "clients" | "workers" | "activity" | "settings";

const statusColors: Record<string, string> = {
  pending: "#fbbf24", reviewing: "#3b82f6", assigned: "#a78bfa",
  in_progress: "#22d3ee", completed: "#34d399", approved: "#34d399",
  rejected: "#ef4444", cancelled: "#666",
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || "#666";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [clientFilter, setClientFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("nexus_dashboard_auth") === "true");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // tRPC queries — fetch from database
  const utils = trpc.useUtils();

  const { data: clientData, isLoading: clientsLoading } = trpc.clientRequest.list.useQuery(
    { page: 1, limit: 100 },
    { refetchInterval: 5000, enabled: isAuthenticated }
  );

  const { data: workerData, isLoading: workersLoading } = trpc.workerApplication.list.useQuery(
    { page: 1, limit: 100 },
    { refetchInterval: 5000, enabled: isAuthenticated }
  );

  const { data: stats } = trpc.dashboard.stats.useQuery(undefined, {
    refetchInterval: 5000,
    enabled: isAuthenticated,
  });

  const { data: activities } = trpc.dashboard.recentActivity.useQuery(
    { limit: 50 },
    { refetchInterval: 5000, enabled: isAuthenticated }
  );

  const clients = clientData?.requests ?? [];
  const workers = workerData?.applications ?? [];

  // Mutations
  const updateClientStatus = trpc.clientRequest.updateStatus.useMutation({
    onSuccess: () => { utils.clientRequest.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const updateWorkerStatus = trpc.workerApplication.updateStatus.useMutation({
    onSuccess: () => { utils.workerApplication.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteClient = trpc.clientRequest.delete.useMutation({
    onSuccess: () => { utils.clientRequest.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteWorker = trpc.workerApplication.delete.useMutation({
    onSuccess: () => { utils.workerApplication.list.invalidate(); utils.dashboard.stats.invalidate(); toast.success("Deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const manualRefresh = useCallback(() => {
    utils.clientRequest.list.invalidate();
    utils.workerApplication.list.invalidate();
    utils.dashboard.stats.invalidate();
    utils.dashboard.recentActivity.invalidate();
    toast.success("Data refreshed");
  }, [utils]);

  useEffect(() => {
    if (isAuthenticated) sessionStorage.setItem("nexus_dashboard_auth", "true");
  }, [isAuthenticated]);

  function verifyPassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      toast.success("Welcome to Command Center");
    } else {
      setPasswordError("Wrong password");
      setPasswordInput("");
    }
  }

  function handleClientStatus(id: number, status: string) {
    updateClientStatus.mutate({ id, status: status as any });
  }

  function handleWorkerStatus(id: number, status: string) {
    updateWorkerStatus.mutate({ id, status: status as any });
  }

  function handleDeleteClient(id: number) {
    if (!window.confirm("Delete this request?")) return;
    deleteClient.mutate({ id });
  }

  function handleDeleteWorker(id: number) {
    if (!window.confirm("Delete this application?")) return;
    deleteWorker.mutate({ id });
  }

  // ─── Password Gate ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#3b82f6]" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Command Center</h1>
            <p className="text-sm text-[#666]">Admin access only</p>
          </div>
          <form onSubmit={verifyPassword} className="glass-panel-strong rounded-2xl p-6 neon-border space-y-4">
            <div>
              <label className="block text-xs text-[#999] mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
                  className={`input-field w-full pr-10 ${passwordError ? "border-red-500/50" : ""}`}
                  placeholder="Enter password..." autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-400 mt-2">{passwordError}</p>}
            </div>
            <button type="submit" className="btn-glow w-full py-3 rounded-xl text-sm font-semibold text-white">Unlock</button>
            <Link to="/" className="block text-center text-xs text-[#666] hover:text-[#3b82f6]">Back to Home</Link>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredClients = clients.filter(c => clientFilter === "all" || c.status === clientFilter);
  const filteredWorkers = workers.filter(w => workerFilter === "all" || w.status === workerFilter);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: `Overview`, icon: LayoutDashboard },
    { id: "clients", label: `Clients (${clients.length})`, icon: Users },
    { id: "workers", label: `Workers (${workers.length})`, icon: Briefcase },
    { id: "activity", label: "Activity", icon: ActivityIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/nexus-logo.png" alt="NEXUSCOLLABS" className="h-8 w-auto object-contain rounded" />
            </Link>
            <div className="h-5 w-px bg-[#222]" />
            <span className="text-xs text-[#666] uppercase tracking-wider hidden sm:inline">Command Center</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={manualRefresh} className="p-2 rounded-lg hover:bg-[#111] text-[#666]" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#999]">DB Connected</span>
            </div>
            <Link to="/" className="p-2 rounded-lg hover:bg-[#111] text-[#666] hover:text-[#3b82f6]" title="Back"><ArrowLeft className="w-4 h-4" /></Link>
          </div>
        </div>
        <div className="flex gap-1 px-4 sm:px-6 pb-2 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id ? "bg-[#3b82f6]/15 text-[#3b82f6]" : "text-[#666] hover:text-[#999]"
              }`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* ===== OVERVIEW ===== */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Clients", value: stats?.totalClients ?? 0, icon: Users, color: "#3b82f6" },
                { label: "Total Workers", value: stats?.totalWorkers ?? 0, icon: Briefcase, color: "#22d3ee" },
                { label: "Active Projects", value: stats?.activeProjects ?? 0, icon: Zap, color: "#a78bfa" },
                { label: "Completed", value: stats?.completedProjects ?? 0, icon: CheckCircle, color: "#34d399" },
              ].map((stat, i) => (
                <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="glass-panel rounded-xl p-4 card-hover">
                  <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-[#666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Clients */}
            <motion.div {...fadeIn} className="glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#222]">
                <h3 className="text-sm font-semibold">Recent Client Requests</h3>
                <button onClick={() => setTab("clients")} className="text-xs text-[#3b82f6] hover:underline">View All</button>
              </div>
              {clientsLoading ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#3b82f6] mx-auto" /></div>
              ) : clients.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="w-8 h-8 text-[#333] mx-auto mb-2" />
                  <p className="text-sm text-[#666]">No client requests yet</p>
                  <p className="text-xs text-[#555] mt-1">Submissions will appear here from the database</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {clients.slice(0, 5).map(req => (
                    <div key={req.id} className="p-4 hover:bg-[#111]">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{req.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {req.email && <span className="text-xs text-[#3b82f6]">{req.email}</span>}
                            {req.phone && <span className="text-xs text-[#22d3ee]">{req.phone}</span>}
                            <span className="text-xs text-[#fbbf24]">{req.serviceNeeded}</span>
                          </div>
                        </div>
                        <StatusBadge status={req.status ?? "pending"} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Workers */}
            <motion.div {...fadeIn} className="glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#222]">
                <h3 className="text-sm font-semibold">Recent Worker Applications</h3>
                <button onClick={() => setTab("workers")} className="text-xs text-[#3b82f6] hover:underline">View All</button>
              </div>
              {workersLoading ? (
                <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#3b82f6] mx-auto" /></div>
              ) : workers.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="w-8 h-8 text-[#333] mx-auto mb-2" />
                  <p className="text-sm text-[#666]">No worker applications yet</p>
                  <p className="text-xs text-[#555] mt-1">Applications will appear here from the database</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {workers.slice(0, 5).map(w => (
                    <div key={w.id} className="p-4 hover:bg-[#111]">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{w.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {w.email && <span className="text-xs text-[#3b82f6]">{w.email}</span>}
                            <span className="text-xs text-[#a78bfa]">{(w.skills as string[] ?? []).slice(0, 3).join(", ")}</span>
                          </div>
                        </div>
                        <StatusBadge status={w.status ?? "pending"} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* How It Works */}
            <motion.div {...fadeIn} className="glass-panel rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-[#22d3ee]" /> Database Storage Active</h3>
              <p className="text-xs text-[#666] mb-3">All submissions are now stored in a centralized database. You can view every request from any device, anywhere in the world.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={manualRefresh}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-xs font-medium hover:bg-[#3b82f6]/20 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ===== CLIENTS - BY SERVICE CATEGORY ===== */}
        {tab === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold">Client Requests by Service</h2>
              <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="input-field text-xs py-2 w-36">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {clientsLoading ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6] mx-auto" />
                <p className="text-sm text-[#666] mt-3">Loading from database...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Inbox className="w-12 h-12 text-[#333] mx-auto mb-3" />
                <p className="text-lg text-[#666] mb-1">No client requests yet</p>
                <p className="text-sm text-[#555]">When someone submits a request form, it will appear here from the database.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(
                  filteredClients.reduce<Record<string, typeof filteredClients>>((groups, c) => {
                    const key = c.serviceNeeded || "Other";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(c);
                    return groups;
                  }, {})
                ).map(([serviceName, serviceClients]) => (
                  <motion.div key={serviceName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 p-4 border-b border-[#222] bg-[#0d0d0d]">
                      <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                      <h3 className="text-sm font-semibold">{serviceName}</h3>
                      <span className="text-xs text-[#666] ml-auto">{serviceClients.length} request{serviceClients.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]">
                      {serviceClients.map(req => {
                        const isExpanded = expandedRow === `client-${req.id}`;
                        const files = (req.referenceFiles ?? []) as string[];
                        return (
                          <div key={req.id}>
                            <div className="p-4 hover:bg-[#111] cursor-pointer transition-colors" onClick={() => setExpandedRow(isExpanded ? null : `client-${req.id}`)}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium">{req.fullName}</p>
                                    <StatusBadge status={req.status ?? "pending"} />
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-xs text-[#3b82f6] flex items-center gap-1"><Mail className="w-3 h-3" />{req.email}</span>
                                    {req.phone && <span className="text-xs text-[#22d3ee] flex items-center gap-1"><Phone className="w-3 h-3" />{req.phone}</span>}
                                    <span className="text-xs text-[#666]">{req.country}</span>
                                    <span className="text-xs text-[#fbbf24]">{req.budgetRange}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#666]">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</span>
                                  <select value={req.status ?? "pending"} onClick={e => e.stopPropagation()} onChange={e => handleClientStatus(req.id, e.target.value)}
                                    className="bg-[#111] border border-[#222] rounded px-2 py-1 text-xs text-[#999]">
                                    {["pending","reviewing","assigned","in_progress","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <button onClick={e => { e.stopPropagation(); handleDeleteClient(req.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-[#666] hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#3b82f6]" /> : <ChevronDown className="w-4 h-4 text-[#666]" />}
                                </div>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="p-4 bg-[#0d0d0d] border-t border-[#1a1a1a] space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                  {[
                                    { l: "Full Name", v: req.fullName },
                                    { l: "Email", v: req.email },
                                    { l: "Phone", v: req.phone ?? "-" },
                                    { l: "Discord", v: req.discordUsername ?? "-" },
                                    { l: "Instagram", v: req.instagramUsername ?? "-" },
                                    { l: "Country", v: req.country },
                                    { l: "Lead Source", v: req.leadSource },
                                    { l: "Payment", v: req.paymentMethod },
                                    { l: "Budget", v: req.budgetRange },
                                    { l: "Deadline", v: req.deadline },
                                    { l: "Service", v: req.serviceNeeded },
                                    { l: "Status", v: req.status ?? "pending" },
                                  ].map((item, i) => (
                                    <div key={i} className="bg-[#111] rounded-lg p-2.5">
                                      <p className="text-[10px] text-[#666] uppercase">{item.l}</p>
                                      <p className="text-sm text-white mt-0.5 break-words">{item.v}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-[#111] rounded-lg p-3">
                                  <p className="text-[10px] text-[#666] uppercase mb-1">Project Details</p>
                                  <p className="text-sm text-[#ccc] whitespace-pre-wrap">{req.projectDetails}</p>
                                </div>
                                {files.length > 0 && (
                                  <div className="bg-[#111] rounded-lg p-3">
                                    <p className="text-[10px] text-[#666] uppercase mb-2">Files ({files.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                      {files.map((url: string, i: number) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1a1a1a] text-xs text-[#999] hover:text-[#3b82f6] transition-colors">
                                          <FolderOpen className="w-3 h-3" />{url.split("/").pop()}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== WORKERS - BY SKILL ===== */}
        {tab === "workers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold">Worker Applications by Skill</h2>
              <select value={workerFilter} onChange={e => setWorkerFilter(e.target.value)} className="input-field text-xs py-2 w-36">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {workersLoading ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#22d3ee] mx-auto" />
                <p className="text-sm text-[#666] mt-3">Loading from database...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Inbox className="w-12 h-12 text-[#333] mx-auto mb-3" />
                <p className="text-lg text-[#666] mb-1">No worker applications yet</p>
                <p className="text-sm text-[#555]">When someone applies, it will appear here from the database.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(
                  filteredWorkers.reduce<Record<string, typeof filteredWorkers>>((groups, w) => {
                    const key = (w.skills as string[] ?? [])[0] || "Other";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(w);
                    return groups;
                  }, {})
                ).map(([skillName, skillWorkers]) => (
                  <motion.div key={skillName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 p-4 border-b border-[#222] bg-[#0d0d0d]">
                      <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                      <h3 className="text-sm font-semibold">{skillName}</h3>
                      <span className="text-xs text-[#666] ml-auto">{skillWorkers.length} application{skillWorkers.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="divide-y divide-[#1a1a1a]">
                      {skillWorkers.map(w => {
                        const isExpanded = expandedRow === `worker-${w.id}`;
                        return (
                          <div key={w.id}>
                            <div className="p-4 hover:bg-[#111] cursor-pointer transition-colors" onClick={() => setExpandedRow(isExpanded ? null : `worker-${w.id}`)}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-medium">{w.fullName}</p>
                                    <StatusBadge status={w.status ?? "pending"} />
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-xs text-[#3b82f6] flex items-center gap-1"><Mail className="w-3 h-3" />{w.email}</span>
                                    {w.phone && <span className="text-xs text-[#22d3ee] flex items-center gap-1"><Phone className="w-3 h-3" />{w.phone}</span>}
                                    <span className="text-xs text-[#666]">{w.country}</span>
                                    <span className="text-xs text-[#a78bfa]">${w.minPrice}-${w.maxPrice}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#666]">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "—"}</span>
                                  {w.status === "pending" && (
                                    <>
                                      <button onClick={e => { e.stopPropagation(); handleWorkerStatus(w.id, "approved"); }} className="p-1.5 rounded hover:bg-emerald-500/10 text-[#666] hover:text-emerald-400" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                                      <button onClick={e => { e.stopPropagation(); handleWorkerStatus(w.id, "rejected"); }} className="p-1.5 rounded hover:bg-red-500/10 text-[#666] hover:text-red-400" title="Reject"><UserX className="w-3.5 h-3.5" /></button>
                                    </>
                                  )}
                                  <button onClick={e => { e.stopPropagation(); handleDeleteWorker(w.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-[#666] hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#3b82f6]" /> : <ChevronDown className="w-4 h-4 text-[#666]" />}
                                </div>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="p-4 bg-[#0d0d0d] border-t border-[#1a1a1a] space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                  {[
                                    { l: "Full Name", v: w.fullName },
                                    { l: "Email", v: w.email },
                                    { l: "Phone", v: w.phone },
                                    { l: "Discord", v: w.discordUsername ?? "-" },
                                    { l: "Instagram", v: w.instagramUsername ?? "-" },
                                    { l: "Country", v: w.country },
                                    { l: "Work Type", v: w.workType },
                                    { l: "Delivery", v: w.deliveryTime },
                                    { l: "Min Price", v: `$${w.minPrice}` },
                                    { l: "Max Price", v: `$${w.maxPrice}` },
                                    { l: "Payments", v: (w.paymentMethods as string[] ?? []).join(", ") },
                                    { l: "Status", v: w.status ?? "pending" },
                                  ].map((item, i) => (
                                    <div key={i} className="bg-[#111] rounded-lg p-2.5">
                                      <p className="text-[10px] text-[#666] uppercase">{item.l}</p>
                                      <p className="text-sm text-white mt-0.5 break-words">{item.v}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-[#111] rounded-lg p-3">
                                  <p className="text-[10px] text-[#666] uppercase mb-2">All Skills</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(w.skills as string[] ?? []).map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">{s}</span>)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ACTIVITY ===== */}
        {tab === "activity" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Activity Log</h2>
            {!activities || activities.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <Clock className="w-12 h-12 text-[#333] mx-auto mb-3" />
                <p className="text-lg text-[#666]">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((log, i) => (
                  <motion.div key={log.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="glass-panel rounded-lg p-4 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#666]">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 uppercase">{log.entityType}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {tab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-[#3b82f6]" /> Info</h3>
                {[
                  { l: "Platform", v: "NEXUS COLLABS" },
                  { l: "Admin Email", v: "nexuscollabs.info@gmail.com" },
                  { l: "Phone", v: "+91 8448179299" },
                  { l: "Storage", v: "PostgreSQL Database" },
                  { l: "Total Services", v: "900+" },
                  { l: "Clients", v: `${clients.length}` },
                  { l: "Workers", v: `${workers.length}` },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <span className="text-xs text-[#666]">{item.l}</span>
                    <span className="text-sm text-[#999]">{item.v}</span>
                  </div>
                ))}
              </div>

              <div className="glass-panel rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-400"><Database className="w-4 h-4" /> Database Status</h3>
                <p className="text-xs text-[#666]">All submissions are stored in a centralized PostgreSQL database. Data is accessible from any device.</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400">Connected to database</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
