// localStorage-based submission storage
// Each browser stores its own data - no backend needed

const CLIENT_KEY = "nexus_client_requests";
const WORKER_KEY = "nexus_worker_applications";
const ACTIVITY_KEY = "nexus_activity_logs";

// ─── Types ───

export interface LocalClientRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  discordUsername: string | null;
  instagramUsername: string | null;
  country: string;
  leadSource: string;
  serviceNeeded: string;
  projectDetails: string;
  budgetRange: string;
  deadline: string;
  paymentMethod: string;
  referenceFiles: string[];
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalWorkerApplication {
  id: number;
  userId: number | null;
  fullName: string;
  email: string;
  phone: string;
  discordUsername: string | null;
  instagramUsername: string | null;
  country: string;
  workType: "part_time" | "full_time";
  skills: string[];
  minPrice: string;
  maxPrice: string;
  deliveryTime: string;
  paymentMethods: string[];
  status: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  portfolios: {
    id: number;
    workerId: number;
    skillName: string;
    portfolioFiles: string[];
    softwareTools: string[];
    experienceDetails: string | null;
    yearsOfExperience: number | null;
    skillLevel: string | null;
    createdAt: string;
  }[];
}

interface ActivityLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}

// ─── Helpers ───

function readStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to localStorage:", e);
  }
}

function addActivityLog(entityType: string, entityId: number, action: string, details: Record<string, unknown> = {}): void {
  const logs = readStorage<ActivityLog>(ACTIVITY_KEY);
  const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
  logs.unshift({ entityType, entityId, action, details, createdAt: new Date().toISOString(), id: newId });
  if (logs.length > 200) logs.length = 200;
  writeStorage(ACTIVITY_KEY, logs);
}

// ─── Client Requests ───

export function saveClientRequest(data: {
  fullName: string;
  email: string;
  phone: string | null;
  discordUsername: string | null;
  instagramUsername: string | null;
  country: string;
  leadSource: string;
  serviceNeeded: string;
  projectDetails: string;
  budgetRange: string;
  deadline: string;
  paymentMethod: string;
  referenceFiles: string[];
}): LocalClientRequest {
  const requests = readStorage<LocalClientRequest>(CLIENT_KEY);
  const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
  const now = new Date().toISOString();

  const entry: LocalClientRequest = {
    ...data,
    id: newId,
    status: "pending",
    adminNotes: null,
    createdAt: now,
    updatedAt: now,
  };

  requests.unshift(entry);
  writeStorage(CLIENT_KEY, requests);
  addActivityLog("client", newId, `New request: ${data.fullName} - ${data.serviceNeeded}`, { service: data.serviceNeeded, budget: data.budgetRange });

  return entry;
}

export function getClientRequests(): LocalClientRequest[] {
  return readStorage<LocalClientRequest>(CLIENT_KEY);
}

export function deleteClientRequest(id: number): void {
  const requests = readStorage<LocalClientRequest>(CLIENT_KEY).filter(r => r.id !== id);
  writeStorage(CLIENT_KEY, requests);
  addActivityLog("client", id, "Client request deleted", {});
}

export function updateClientRequestStatus(id: number, status: string): void {
  const requests = readStorage<LocalClientRequest>(CLIENT_KEY);
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return;
  requests[idx] = { ...requests[idx], status, updatedAt: new Date().toISOString() };
  writeStorage(CLIENT_KEY, requests);
  addActivityLog("client", id, `Status changed to ${status}`, { status });
}

// ─── Worker Applications ───

export function saveWorkerApplication(data: {
  fullName: string;
  email: string;
  phone: string;
  discordUsername: string | null;
  instagramUsername: string | null;
  country: string;
  workType: "part_time" | "full_time";
  skills: string[];
  minPrice: string;
  maxPrice: string;
  deliveryTime: string;
  paymentMethods: string[];
  portfolios: LocalWorkerApplication["portfolios"];
}): LocalWorkerApplication {
  const apps = readStorage<LocalWorkerApplication>(WORKER_KEY);
  const newId = apps.length > 0 ? Math.max(...apps.map(a => a.id)) + 1 : 1;
  const now = new Date().toISOString();

  const entry: LocalWorkerApplication = {
    ...data,
    userId: null,
    id: newId,
    status: "pending",
    adminNotes: null,
    createdAt: now,
    updatedAt: now,
  };

  apps.unshift(entry);
  writeStorage(WORKER_KEY, apps);
  addActivityLog("worker", newId, `New application: ${data.fullName} - ${data.skills.join(", ")}`, { skills: data.skills, workType: data.workType });

  return entry;
}

export function getWorkerApplications(): LocalWorkerApplication[] {
  return readStorage<LocalWorkerApplication>(WORKER_KEY);
}

export function deleteWorkerApplication(id: number): void {
  const apps = readStorage<LocalWorkerApplication>(WORKER_KEY).filter(a => a.id !== id);
  writeStorage(WORKER_KEY, apps);
  addActivityLog("worker", id, "Worker application deleted", {});
}

export function updateWorkerApplicationStatus(id: number, status: string): void {
  const apps = readStorage<LocalWorkerApplication>(WORKER_KEY);
  const idx = apps.findIndex(a => a.id === id);
  if (idx === -1) return;
  apps[idx] = { ...apps[idx], status, updatedAt: new Date().toISOString() };
  writeStorage(WORKER_KEY, apps);
  addActivityLog("worker", id, `Status changed to ${status}`, { status });
}

// ─── Activity Logs ───

export function getActivityLogs(): ActivityLog[] {
  return readStorage<ActivityLog>(ACTIVITY_KEY);
}

// ─── Stats ───

export function getLocalStats() {
  const clients = getClientRequests();
  const workers = getWorkerApplications();

  const clientStatusCounts: Record<string, number> = {};
  clients.forEach(c => { clientStatusCounts[c.status] = (clientStatusCounts[c.status] || 0) + 1; });

  const workerStatusCounts: Record<string, number> = {};
  workers.forEach(w => { workerStatusCounts[w.status] = (workerStatusCounts[w.status] || 0) + 1; });

  return {
    totalClients: clients.length,
    totalWorkers: workers.length,
    totalProjects: clients.length,
    pendingRequests: clientStatusCounts["pending"] || 0,
    activeProjects: (clientStatusCounts["assigned"] || 0) + (clientStatusCounts["in_progress"] || 0),
    completedProjects: clientStatusCounts["completed"] || 0,
    approvedWorkers: workerStatusCounts["approved"] || 0,
  };
}

// ─── Get clients grouped by service category ───
export function getClientsByService(): Record<string, LocalClientRequest[]> {
  const clients = getClientRequests();
  const grouped: Record<string, LocalClientRequest[]> = {};
  for (const c of clients) {
    const cat = c.serviceNeeded || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  }
  return grouped;
}

// ─── Get workers grouped by skill ───
export function getWorkersBySkill(): Record<string, LocalWorkerApplication[]> {
  const workers = getWorkerApplications();
  const grouped: Record<string, LocalWorkerApplication[]> = {};
  for (const w of workers) {
    for (const skill of w.skills || []) {
      if (!grouped[skill]) grouped[skill] = [];
      grouped[skill].push(w);
    }
  }
  return grouped;
}

// ─── Clear all data (for testing) ───
export function clearAllData(): void {
  localStorage.removeItem(CLIENT_KEY);
  localStorage.removeItem(WORKER_KEY);
  localStorage.removeItem(ACTIVITY_KEY);
}
