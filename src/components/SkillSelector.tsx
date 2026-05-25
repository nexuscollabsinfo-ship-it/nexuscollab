import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check, ChevronDown, Code2, Palette, Megaphone, Lock, Briefcase, Brain, PenTool, Video, Server, BarChart3, Sparkles, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SkillSelectorProps {
  selected: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}

import { serviceCategories } from "@/lib/servicesData";

const iconComponentMap: Record<string, React.ElementType> = {
  Code2, Palette, Megaphone, Lock, Briefcase, Brain, PenTool, Video, Server, BarChart3, Sparkles,
};

const skillCategories = serviceCategories.map(cat => ({
  id: cat.id,
  label: cat.title,
  icon: iconComponentMap[cat.icon] || Code2,
  color: cat.color,
  skills: cat.skills.map(s => s.name),
}));

const allSkills = skillCategories.flatMap(c => c.skills);
const OTHER_COLOR = "#f59e0b";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ─── Desktop Dropdown with Portal ───
function DesktopDropdown({
  isOpen,
  onClose,
  triggerRef,
  selected,
  onToggle,
  onAddCustom,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  selected: string[];
  onToggle: (skill: string) => void;
  onAddCustom: (skill: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, openAbove: false });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 440;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setPosition({
      top: openAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 420),
      openAbove,
    });

    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isOpen, triggerRef]);

  // Click outside + ESC
  useEffect(() => {
    if (!isOpen) return;
    function handleMouse(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleMouse);
      document.addEventListener("keydown", handleKey);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleMouse);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveCategory("all");
      setShowOtherInput(false);
      setOtherValue("");
    }
  }, [isOpen]);

  // Focus other input when shown
  useEffect(() => {
    if (showOtherInput) {
      setTimeout(() => otherRef.current?.focus(), 100);
    }
  }, [showOtherInput]);

  const filteredCategories = useMemo(() => {
    if (search.trim()) {
      return skillCategories
        .map(cat => ({
          ...cat,
          skills: cat.skills.filter(s => s.toLowerCase().includes(search.toLowerCase())),
        }))
        .filter(cat => cat.skills.length > 0);
    }
    if (activeCategory === "all") return skillCategories;
    return skillCategories.filter(c => c.id === activeCategory);
  }, [search, activeCategory]);

  const skillToCategory = useMemo(() => {
    const map = new Map<string, typeof skillCategories[0]>();
    for (const cat of skillCategories) {
      for (const skill of cat.skills) map.set(skill, cat);
    }
    return map;
  }, []);

  const totalFiltered = useMemo(
    () => filteredCategories.reduce((sum, c) => sum + c.skills.length, 0),
    [filteredCategories]
  );

  function handleAddOther() {
    const trimmed = otherValue.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setOtherValue("");
    setShowOtherInput(false);
  }

  function handleOtherKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOther();
    }
    if (e.key === "Escape") {
      setShowOtherInput(false);
      setOtherValue("");
    }
  }

  if (!isOpen) return null;

  const portalContent = (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
        style={{ pointerEvents: "auto", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: position.openAbove ? 12 : -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: position.openAbove ? 12 : -12, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute flex flex-col overflow-hidden"
        style={{
          pointerEvents: "auto",
          top: position.top,
          left: position.left,
          width: position.width,
          maxHeight: 440,
          background: "rgba(10, 10, 10, 0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(59, 130, 246, 0.25)",
          borderRadius: "16px",
          boxShadow: "0 0 40px rgba(59, 130, 246, 0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Search Bar */}
        <div className="shrink-0 p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,10,0.95)", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#666" }} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg text-sm text-white placeholder-[#666] focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white" style={{ color: "#666" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {!search.trim() && (
          <div className="shrink-0 flex gap-1 p-2 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,10,0.95)", position: "sticky", top: 56, zIndex: 10 }}>
            <button type="button" onClick={() => setActiveCategory("all")} className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex-shrink-0" style={activeCategory === "all" ? { background: "rgba(59,130,246,0.2)", color: "#3b82f6" } : { color: "#666" }}>
              All ({allSkills.length})
            </button>
            {skillCategories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0" style={activeCategory === cat.id ? { background: `${cat.color}20`, color: cat.color } : { color: "#666" }}>
                <cat.icon className="w-3 h-3" />{cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Skills List */}
        <div className="flex-1 overflow-y-auto skill-dropdown-scroll p-2 space-y-1" style={{ maxHeight: 310 }}>
          {search.trim() && totalFiltered === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "#666" }}>No skills found for &quot;{search}&quot;</p>
          )}

          {filteredCategories.map(cat => (
            <div key={cat.id}>
              {!search.trim() && (
                <div className="flex items-center gap-2 px-2 py-1.5 mt-1">
                  <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
              )}
              {cat.skills.map(skill => {
                const isSelected = selected.includes(skill);
                return (
                  <button key={`${cat.id}-${skill}`} type="button" onClick={() => onToggle(skill)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                    style={isSelected ? { background: "rgba(59,130,246,0.1)", color: "#3b82f6" } : { color: "#999" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                    <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all" style={isSelected ? { background: "#3b82f6", borderColor: "#3b82f6" } : { borderColor: "#444" }}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-left flex-1">{skill}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${skillToCategory.get(skill)?.color}20`, color: skillToCategory.get(skill)?.color }}>
                        {skillToCategory.get(skill)?.label.split(" ")[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* ── Other Input ── */}
          {!search.trim() && (
            <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {!showOtherInput ? (
                <button type="button" onClick={() => setShowOtherInput(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{ color: OTHER_COLOR }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0" style={{ borderColor: `${OTHER_COLOR}40` }}>
                    <Plus className="w-3 h-3" style={{ color: OTHER_COLOR }} />
                  </div>
                  <span className="text-left flex-1 font-medium">Add Custom Skill...</span>
                </button>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Plus className="w-3.5 h-3.5" style={{ color: OTHER_COLOR }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: OTHER_COLOR }}>Custom Skill</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(245,158,11,0.15)" }} />
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={otherRef}
                      type="text"
                      value={otherValue}
                      onChange={e => setOtherValue(e.target.value)}
                      onKeyDown={handleOtherKeyDown}
                      placeholder="Type your skill..."
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-[#666] focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.3)" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.1)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={handleAddOther}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                      style={{ background: OTHER_COLOR, opacity: otherValue.trim() ? 1 : 0.5 }}
                      disabled={!otherValue.trim()}>
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(10,10,10,0.95)" }}>
          <span className="text-xs" style={{ color: "#666" }}>{selected.length} selected</span>
          {selected.length > 0 && (
            <button type="button" onClick={() => { onToggle("__clear_all__"); }} className="text-xs transition-colors hover:text-red-300" style={{ color: "#f87171" }}>Clear all</button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(portalContent, document.body);
}

// ─── Mobile Bottom Sheet ───
function MobileSheet({
  open,
  onOpenChange,
  selected,
  onToggle,
  onAddCustom,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: string[];
  onToggle: (skill: string) => void;
  onAddCustom: (skill: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setActiveCategory("all");
      setShowOtherInput(false);
      setOtherValue("");
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (showOtherInput) {
      setTimeout(() => otherRef.current?.focus(), 100);
    }
  }, [showOtherInput]);

  const filteredCategories = useMemo(() => {
    if (search.trim()) {
      return skillCategories
        .map(cat => ({ ...cat, skills: cat.skills.filter(s => s.toLowerCase().includes(search.toLowerCase())) }))
        .filter(cat => cat.skills.length > 0);
    }
    if (activeCategory === "all") return skillCategories;
    return skillCategories.filter(c => c.id === activeCategory);
  }, [search, activeCategory]);

  const totalFiltered = useMemo(() => filteredCategories.reduce((sum, c) => sum + c.skills.length, 0), [filteredCategories]);

  const skillToCategory = useMemo(() => {
    const map = new Map<string, typeof skillCategories[0]>();
    for (const cat of skillCategories) {
      for (const skill of cat.skills) map.set(skill, cat);
    }
    return map;
  }, []);

  function handleAddOther() {
    const trimmed = otherValue.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setOtherValue("");
    setShowOtherInput(false);
  }

  function handleOtherKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAddOther(); }
    if (e.key === "Escape") { setShowOtherInput(false); setOtherValue(""); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0 overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: "rgba(10, 10, 10, 0.97)", border: "1px solid rgba(59, 130, 246, 0.2)", boxShadow: "0 0 40px rgba(59, 130, 246, 0.15), 0 25px 50px rgba(0,0,0,0.6)", borderRadius: "20px 20px 0 0" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <DialogHeader className="px-4 pb-2">
          <DialogTitle className="text-lg font-bold text-white">
            Select Skills <span className="ml-2 text-sm font-normal" style={{ color: "#666" }}>({selected.length} selected)</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#666" }} />
            <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..."
              className="w-full pl-9 pr-8 py-2.5 rounded-lg text-sm text-white placeholder-[#666] focus:outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
            {search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#666" }}><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>

        {/* Category tabs */}
        {!search.trim() && (
          <div className="shrink-0 flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
            <button type="button" onClick={() => setActiveCategory("all")} className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0" style={activeCategory === "all" ? { background: "rgba(59,130,246,0.2)", color: "#3b82f6" } : { color: "#666" }}>All</button>
            {skillCategories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)} className="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1 flex-shrink-0" style={activeCategory === cat.id ? { background: `${cat.color}20`, color: cat.color } : { color: "#666" }}>
                <cat.icon className="w-3 h-3" />{cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Skills list */}
        <div className="flex-1 overflow-y-auto skill-dropdown-scroll px-4 pb-4 space-y-1" style={{ maxHeight: "50vh" }}>
          {search.trim() && totalFiltered === 0 && <p className="text-sm text-center py-8" style={{ color: "#666" }}>No skills found</p>}
          {filteredCategories.map(cat => (
            <div key={cat.id}>
              {!search.trim() && (
                <div className="flex items-center gap-2 px-1 py-1.5 mt-1">
                  <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>
              )}
              {cat.skills.map(skill => {
                const isSelected = selected.includes(skill);
                return (
                  <button key={`${cat.id}-${skill}`} type="button" onClick={() => onToggle(skill)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all" style={isSelected ? { background: "rgba(59,130,246,0.1)", color: "#3b82f6" } : { color: "#999" }}>
                    <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0" style={isSelected ? { background: "#3b82f6", borderColor: "#3b82f6" } : { borderColor: "#444" }}>{isSelected && <Check className="w-3 h-3 text-white" />}</div>
                    <span className="text-left flex-1">{skill}</span>
                    {isSelected && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${skillToCategory.get(skill)?.color}20`, color: skillToCategory.get(skill)?.color }}>{skillToCategory.get(skill)?.label.split(" ")[0]}</span>}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Other Input */}
          {!search.trim() && (
            <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {!showOtherInput ? (
                <button type="button" onClick={() => setShowOtherInput(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all" style={{ color: OTHER_COLOR }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0" style={{ borderColor: `${OTHER_COLOR}40` }}><Plus className="w-3 h-3" style={{ color: OTHER_COLOR }} /></div>
                  <span className="text-left flex-1 font-medium">Add Custom Skill...</span>
                </button>
              ) : (
                <div className="py-2 space-y-2">
                  <div className="flex items-center gap-2 px-1 py-1">
                    <Plus className="w-3.5 h-3.5" style={{ color: OTHER_COLOR }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: OTHER_COLOR }}>Custom Skill</span>
                  </div>
                  <div className="flex gap-2">
                    <input ref={otherRef} type="text" value={otherValue} onChange={e => setOtherValue(e.target.value)} onKeyDown={handleOtherKeyDown} placeholder="Type your skill..."
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-[#666] focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.3)" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }} />
                    <button type="button" onClick={handleAddOther} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: OTHER_COLOR, opacity: otherValue.trim() ? 1 : 0.5 }} disabled={!otherValue.trim()}>Add</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="text-xs" style={{ color: "#666" }}>{selected.length} selected</span>
          <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2 rounded-lg text-sm font-semibold text-white btn-glow">Done</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Selected Skill Chip ───
function SkillChip({ skill, color, onRemove }: { skill: string; color: string; onRemove: () => void }) {
  return (
    <motion.span layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
      style={{ background: `${color}15`, borderColor: `${color}30`, color: color, boxShadow: `0 0 8px ${color}15` }}>
      {skill}
      <button type="button" onClick={onRemove} className="hover:opacity-70 transition-opacity rounded-full p-0.5" style={{ color: color }}><X className="w-3 h-3" /></button>
    </motion.span>
  );
}

// ─── Main SkillSelector ───
export function SkillSelector({ selected, onChange, error }: SkillSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const skillToCategory = useMemo(() => {
    const map = new Map<string, typeof skillCategories[0]>();
    for (const cat of skillCategories) {
      for (const skill of cat.skills) map.set(skill, cat);
    }
    return map;
  }, []);

  const handleToggle = useCallback((skill: string) => {
    if (skill === "__clear_all__") { onChange([]); return; }
    const next = selected.includes(skill) ? selected.filter(s => s !== skill) : [...selected, skill];
    onChange(next);
  }, [selected, onChange]);

  const handleAddCustom = useCallback((skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
  }, [selected, onChange]);

  const removeSkill = useCallback((skill: string) => {
    onChange(selected.filter(s => s !== skill));
  }, [selected, onChange]);

  return (
    <div className="relative" style={{ zIndex: isOpen ? 50 : "auto" }}>
      {/* Trigger */}
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between text-left transition-all"
        style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: error ? "1px solid rgba(239,68,68,0.5)" : isOpen ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: selected.length ? "#fff" : "#666" }}>
        <span className="text-sm">{selected.length ? `${selected.length} skill${selected.length > 1 ? "s" : ""} selected` : "Select skills..."}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "#666" }} />
        </motion.div>
      </button>

      {error && <p className="text-xs mt-1.5" style={{ color: "#f87171" }}>{error}</p>}

      {/* Selected chips */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex flex-wrap gap-2 mt-3">
            <AnimatePresence>
              {selected.map(skill => (
                <SkillChip key={skill} skill={skill}
                  color={skillToCategory.get(skill)?.color || OTHER_COLOR}
                  onRemove={() => removeSkill(skill)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Portal dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <DesktopDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} selected={selected} onToggle={handleToggle} onAddCustom={handleAddCustom} />
          )}
        </AnimatePresence>
      )}

      {/* Mobile: Bottom sheet */}
      {isMobile && (
        <MobileSheet open={isOpen} onOpenChange={setIsOpen} selected={selected} onToggle={handleToggle} onAddCustom={handleAddCustom} />
      )}
    </div>
  );
}
