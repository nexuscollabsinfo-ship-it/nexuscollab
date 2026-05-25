import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";

const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Services"));
const ClientRequest = lazy(() => import("./pages/ClientRequest"));
const WorkerApplication = lazy(() => import("./pages/WorkerApplication"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#666]">Loading NEXUS...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ParticleBackground />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/request" element={<ClientRequest />} />
          <Route path="/apply" element={<WorkerApplication />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </>
  );
}
