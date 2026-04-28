import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faSearch,
  faBriefcase,
  faBuilding,
  faCalendar,
  faSliders,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ExperienceCard from "../Components/ExperienceCard";
import PopularCompanies from "../Components/PopularCompanies";

// API Base configuration
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn("[PlacementStats] VITE_API_BASE_URL is not set. Using /api.");
}

const LIMIT = 10;

// Debounce hook for smooth typing search
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Dropdown Component ──────────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  type: string;
  openDropdown: string | null;
  setOpenDropdown: (v: string | null) => void;
  onChange: (type: string, value: string | number) => void;
  alignRight?: boolean;
  searchable?: boolean;
}

const Dropdown = ({
  label,
  value,
  options,
  type,
  openDropdown,
  setOpenDropdown,
  onChange,
  alignRight = false,
  searchable = false,
}: DropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Clear local search term when the dropdown is opened via the button click handler below.

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (openDropdown === type && !containerRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown, type, setOpenDropdown]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        onClick={() => {
          const next = openDropdown === type ? null : type;
          setOpenDropdown(next);
          if (next === type) setSearchTerm("");
        }}
        aria-haspopup="listbox"
        aria-expanded={openDropdown === type}
        className="cursor-pointer w-full sm:min-w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] text-white py-2.5 px-4 rounded-lg text-sm transition-all hover:border-[#00e5ff] focus:ring-2 focus:ring-cyan-400/20 outline-none flex justify-between items-center gap-2"
      >
        <span className="flex-1 min-w-0 truncate text-left">
          <span className="text-[#888] mr-1">{label}:</span>
          <span className="truncate">
            {value === "newest" ? "Newest First" : value === "oldest" ? "Oldest First" : value}
          </span>
        </span>
      </button>

      {openDropdown === type && (
        <div
          className={`absolute top-[115%] ${
            alignRight ? "right-0" : "left-0"
          } w-full sm:w-[220px] min-w-[200px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col`}
        >
          {searchable && (
            <div className="p-2 border-b border-[#2a2a2a]">
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white py-1.5 px-3 rounded text-sm placeholder-[#666] outline-none border border-[#2a2a2a] focus:border-[#00e5ff]/50"
                autoFocus
              />
            </div>
          )}
          <ul role="listbox" className="py-2 max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-[#666]">No options found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => {
                    onChange(type, opt);
                    setOpenDropdown(null);
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#2a2a2a] ${
                    value === opt ? "text-[#00e5ff] bg-[#00e5ff]/5" : "text-[#ccc]"
                  }`}
                >
                  {opt === "newest" ? "Newest First" : opt === "oldest" ? "Oldest First" : opt}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Skeletons ───────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#2a2a2a] animate-pulse">
    <div className="flex justify-between gap-3 mb-4">
      <div className="h-6 bg-[#2a2a2a] rounded w-1/3" />
      <div className="h-6 bg-[#2a2a2a] rounded-full w-20" />
    </div>
    <div className="h-4 bg-[#2a2a2a] rounded w-1/2 mb-2" />
    <div className="h-4 bg-[#2a2a2a] rounded w-1/4" />
  </div>
);

const StatSkeleton = () => (
  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 animate-pulse">
    <div className="h-3 bg-[#2a2a2a] rounded w-24 mb-3" />
    <div className="h-8 bg-[#2a2a2a] rounded w-16" />
  </div>
);

// ─── Types ───────────────────────────────────────────────────────────────────
interface Experience {
  id: number;
  company: string;
  company_id: number;
  role: string;
  candidate: string;
  date: string;
  tags?: string[];
  year?: number;
  ctc?: number;
  cgpa?: number;
}

interface ApiStats {
  totalExperiences: number;
  totalCompanies: number;
  uniqueRoles: number;
  yearsRepresented: number;
  maxCTC: number;
}

// ─── Main Component ──────────────────────────────────────────────────────────
const PlacementStats = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [stats, setStats] = useState<ApiStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [filterCompanies, setFilterCompanies] = useState<string[]>(["All"]);
  const [filterRoles, setFilterRoles] = useState<string[]>(["All"]);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState({
    company: searchParams.get("company") || "All",
    role: searchParams.get("role") || "All",
    year: searchParams.get("year") ? Number(searchParams.get("year")) : ("All" as number | "All"),
    sort: searchParams.get("sort") || "newest",
  });

  const [advancedUI, setAdvancedUI] = useState({
    minCTC: Number(searchParams.get("minCTC")) || 0,
    maxCTC: Number(searchParams.get("maxCTC")) || 100,
    minCGPA: Number(searchParams.get("minCGPA")) || 0,
    maxCGPA: Number(searchParams.get("maxCGPA")) || 10,
  });

  const [activeAdvanced, setActiveAdvanced] = useState({ ...advancedUI });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const availableYears = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - i);
  }, []);

  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (activeAdvanced.minCTC > 0) n++;
    if (activeAdvanced.maxCTC < 100) n++;
    if (activeAdvanced.minCGPA > 0) n++;
    if (activeAdvanced.maxCGPA < 10) n++;
    return n;
  }, [activeAdvanced]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (!res.ok) throw new Error("Stats fetch failed");
        const data: ApiStats = await res.json();
        setStats(data);
      } catch {
        // Silent degrade
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [companiesRes, rolesRes] = await Promise.all([
          fetch(`${API_BASE}/filters/companies`),
          fetch(`${API_BASE}/filters/roles`),
        ]);
        if (companiesRes.ok) {
          const companies: string[] = await companiesRes.json();
          setFilterCompanies(["All", ...companies]);
        }
        if (rolesRes.ok) {
          const roles: string[] = await rolesRes.json();
          setFilterRoles(["All", ...roles]);
        }
      } catch {
        // Silent degrade
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.company !== "All") params.set("company", filters.company);
    if (filters.role !== "All") params.set("role", filters.role);
    if (filters.year !== "All") params.set("year", filters.year.toString());
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (debouncedSearch) params.set("search", debouncedSearch);
    
    if (activeAdvanced.minCTC > 0) params.set("minCTC", activeAdvanced.minCTC.toString());
    if (activeAdvanced.maxCTC < 100) params.set("maxCTC", activeAdvanced.maxCTC.toString());
    if (activeAdvanced.minCGPA > 0) params.set("minCGPA", activeAdvanced.minCGPA.toString());
    if (activeAdvanced.maxCGPA < 10) params.set("maxCGPA", activeAdvanced.maxCGPA.toString());

    setSearchParams(params, { replace: true });
  }, [filters, activeAdvanced, debouncedSearch, setSearchParams]);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setShowAdvancedFilters(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setExperiences([]);
    setPage(1);
    setHasMore(true);
    hasMoreRef.current = true;
    setTotalCount(null);
  }, [filters, activeAdvanced, debouncedSearch]);

  const fetchExperiences = useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        sort: filters.sort,
      });

      if (filters.company !== "All") params.append("company", filters.company);
      if (filters.role !== "All") params.append("role", filters.role);
      if (filters.year !== "All") params.append("year", filters.year.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (activeAdvanced.minCTC > 0) params.append("minCTC", activeAdvanced.minCTC.toString());
      if (activeAdvanced.maxCTC < 100) params.append("maxCTC", activeAdvanced.maxCTC.toString());
      if (activeAdvanced.minCGPA > 0) params.append("minCGPA", activeAdvanced.minCGPA.toString());
      if (activeAdvanced.maxCGPA < 10) params.append("maxCGPA", activeAdvanced.maxCGPA.toString());

      const res = await fetch(`${API_BASE}/experiences?${params}`, { signal: abortSignal });

      if (!res.ok) throw new Error("Failed to fetch");

      const data: { results: Experience[]; total: number } = await res.json();

      setExperiences((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
      setTotalCount(data.total);

      const moreAvailable = data.results.length === LIMIT;
      setHasMore(moreAvailable);
      hasMoreRef.current = moreAvailable;
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Experience fetch failed:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [page, filters, activeAdvanced, debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    fetchExperiences(controller.signal);
    return () => controller.abort();
  }, [fetchExperiences]);

  const handleFilterChange = useCallback((type: string, value: string | number) => {
    setFilters((f) => ({ ...f, [type]: value }));
  }, []);

  const handleApplyAdvancedFilters = () => {
    setActiveAdvanced(advancedUI);
    setShowAdvancedFilters(false);
  };

  const handleResetAdvancedFilters = () => {
    const resetState = { minCTC: 0, maxCTC: 100, minCGPA: 0, maxCGPA: 10 };
    setAdvancedUI(resetState);
    setActiveAdvanced(resetState);
    setShowAdvancedFilters(false);
  };

  return (
    // FIX APPLIED HERE: Added w-full, max-w-full, and box-border so it never exceeds its parent width
    <div className="w-full max-w-full min-h-screen bg-[#121212] text-white p-4 md:p-6 lg:p-10 overflow-x-hidden box-border">
      <PopularCompanies />

      {/* Aggregate Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12 mb-8 md:mb-10">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            {(
              [
                { icon: faBriefcase, label: "Total Experiences", value: stats?.totalExperiences },
                { icon: faBuilding, label: "Companies", value: stats?.totalCompanies },
                { icon: faBriefcase, label: "Roles", value: stats?.uniqueRoles },
                { icon: faCalendar, label: "Years", value: stats?.yearsRepresented },
              ] as const
            ).map(({ icon, label, value }) => (
              <div
                key={label}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#00e5ff]/30 transition-colors flex flex-col min-w-0"
              >
                <div className="flex items-center gap-2 mb-2 min-w-0">
                  <FontAwesomeIcon icon={icon} className="text-[#00e5ff] text-sm shrink-0" />
                  <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold truncate">
                    {label}
                  </span>
                </div>
                <p className="text-2xl font-bold truncate">{value ?? "—"}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start mt-8 md:mt-12 w-full max-w-full">
        
        {/* Year Sidebar */}
        <aside className="w-full lg:w-44 lg:sticky lg:top-10 shrink-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-4 lg:py-6 overflow-hidden">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-[#444] px-4 lg:px-6 mb-3 lg:mb-4">
              Filter by Year
            </h3>
            <ul className="flex flex-row lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar px-4 lg:px-0">
              {(["All", ...availableYears] as (number | "All")[]).map((y) => (
                <li
                  key={y}
                  onClick={() => handleFilterChange("year", y)}
                  className={`flex items-center justify-between px-4 lg:px-6 py-2 lg:py-3 cursor-pointer transition-all duration-200 rounded-lg lg:rounded-none whitespace-nowrap border lg:border-transparent ${
                    filters.year === y
                      ? "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30"
                      : "bg-[#242424] lg:bg-transparent text-[#aaa] border-[#333] hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{y === "All" ? "All Time" : y}</span>
                  {filters.year === y && (
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="hidden lg:block text-[4px] text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,1)]"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full max-w-full">
          <header className="flex flex-col gap-5 md:gap-6 mb-8 md:mb-10 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight truncate">Placement Experiences</h2>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all w-full sm:w-fit border shrink-0 ${
                  showAdvancedFilters || activeAdvancedCount > 0
                    ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]"
                    : "bg-[#1e1e1e] border-[#2a2a2a] text-[#888] hover:border-[#00e5ff] hover:text-[#00e5ff]"
                }`}
              >
                <FontAwesomeIcon icon={faSliders} className="text-sm" />
                Advanced Filters
                {activeAdvancedCount > 0 && (
                  <span className="ml-1 bg-[#00e5ff] text-black text-[10px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center leading-none">
                    {activeAdvancedCount}
                  </span>
                )}
              </button>
            </div>

            <div className="relative min-w-0">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white py-3 px-4 pl-11 rounded-lg text-sm placeholder-[#666] focus:ring-2 focus:ring-[#00e5ff] focus:border-transparent outline-none transition-all hover:border-[#00e5ff]/50"
              />
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#888]">Advanced Filters</h3>
                  <button onClick={() => setShowAdvancedFilters(false)} className="text-[#666] hover:text-white">
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CTC Filters */}
                  <div>
                    <label className="text-sm font-medium text-[#aaa] mb-4 block">CTC Range (LPA)</label>
                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
                      <div className="w-full flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">Min</span>
                          <input
                            type="number"
                            min="0"
                            max={advancedUI.maxCTC}
                            value={advancedUI.minCTC}
                            onChange={(e) =>
                              setAdvancedUI((p) => ({
                                ...p,
                                minCTC: Math.min(Number(e.target.value), p.maxCTC),
                              }))
                            }
                            className="w-16 bg-[#121212] border border-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none focus:border-[#00e5ff] text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={advancedUI.minCTC}
                          onChange={(e) =>
                            setAdvancedUI((p) => ({
                              ...p,
                              minCTC: Math.min(Number(e.target.value), p.maxCTC),
                            }))
                          }
                          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                        />
                      </div>
                      <div className="w-full flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">Max</span>
                          <input
                            type="number"
                            min={advancedUI.minCTC}
                            max="100"
                            value={advancedUI.maxCTC}
                            onChange={(e) =>
                              setAdvancedUI((p) => ({
                                ...p,
                                maxCTC: Math.max(Number(e.target.value), p.minCTC),
                              }))
                            }
                            className="w-16 bg-[#121212] border border-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none focus:border-[#00e5ff] text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={advancedUI.maxCTC}
                          onChange={(e) =>
                            setAdvancedUI((p) => ({
                              ...p,
                              maxCTC: Math.max(Number(e.target.value), p.minCTC),
                            }))
                          }
                          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CGPA Filters */}
                  <div>
                    <label className="text-sm font-medium text-[#aaa] mb-4 block">CGPA Range</label>
                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
                      <div className="w-full flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">Min</span>
                          <input
                            type="number"
                            min="0"
                            max={advancedUI.maxCGPA}
                            step="0.1"
                            value={advancedUI.minCGPA}
                            onChange={(e) =>
                              setAdvancedUI((p) => ({
                                ...p,
                                minCGPA: Math.min(Number(e.target.value), p.maxCGPA),
                              }))
                            }
                            className="w-16 bg-[#121212] border border-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none focus:border-[#00e5ff] text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={advancedUI.minCGPA}
                          onChange={(e) =>
                            setAdvancedUI((p) => ({
                              ...p,
                              minCGPA: Math.min(Number(e.target.value), p.maxCGPA),
                            }))
                          }
                          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                        />
                      </div>
                      <div className="w-full flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#666]">Max</span>
                          <input
                            type="number"
                            min={advancedUI.minCGPA}
                            max="10"
                            step="0.1"
                            value={advancedUI.maxCGPA}
                            onChange={(e) =>
                              setAdvancedUI((p) => ({
                                ...p,
                                maxCGPA: Math.max(Number(e.target.value), p.minCGPA),
                              }))
                            }
                            className="w-16 bg-[#121212] border border-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none focus:border-[#00e5ff] text-center"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={advancedUI.maxCGPA}
                          onChange={(e) =>
                            setAdvancedUI((p) => ({
                              ...p,
                              maxCGPA: Math.max(Number(e.target.value), p.minCGPA),
                            }))
                          }
                          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleResetAdvancedFilters}
                    className="w-1/3 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-[#aaa] hover:text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleApplyAdvancedFilters}
                    className="w-2/3 py-2.5 bg-[#00e5ff] hover:bg-[#00cce6] text-black text-sm font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Basic Filters Dropdowns */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full">
              <div className="w-full sm:w-auto flex-1 min-w-0">
                <Dropdown
                  label="Company"
                  value={filters.company}
                  options={filterCompanies}
                  type="company"
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  onChange={handleFilterChange}
                  searchable={true}
                />
              </div>
              <div className="w-full sm:w-auto flex-1 min-w-0">
                <Dropdown
                  label="Role"
                  value={filters.role}
                  options={filterRoles}
                  type="role"
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  onChange={handleFilterChange}
                  searchable={true}
                />
              </div>
              <div className="w-full sm:w-auto min-w-0">
                <Dropdown
                  label="Sort"
                  value={filters.sort}
                  options={["newest", "oldest"]}
                  type="sort"
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  onChange={handleFilterChange}
                  alignRight={true}
                />
              </div>
            </div>
          </header>

          {totalCount !== null && (
            <p className="text-sm text-[#555] mb-6 px-1">
              Showing <span className="text-[#888] font-medium">{experiences.length}</span> of{" "}
              <span className="text-[#888] font-medium">{totalCount}</span> results
            </p>
          )}

          <div className="grid gap-4 md:gap-6 min-w-0">
            {loading && page === 1
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : experiences.map((item, index) => (
                  <div
                    ref={experiences.length === index + 1 ? lastElementRef : null}
                    key={`${item.id}-${index}`}
                    className="transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
                    onClick={() => navigate("/discussion")}
                  >
                    <ExperienceCard {...item} />
                  </div>
                ))}
          </div>

          {loading && page > 1 && (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-transparent border-[#00e5ff]" />
            </div>
          )}

          {!hasMore && experiences.length > 0 && (
            <p className="text-center mt-12 text-[#444] text-sm font-medium border-t border-[#1a1a1a] pt-8">
              End of list
            </p>
          )}

          {experiences.length === 0 && !loading && (
            <div className="text-center py-10 md:py-20 bg-[#1a1a1a] rounded-3xl border border-dashed border-[#2a2a2a] mx-2 mt-4">
              <FontAwesomeIcon icon={faSearch} className="text-[#444] text-4xl mb-4" />
              <p className="text-[#666] text-lg font-medium mb-2">No experiences found</p>
              <p className="text-[#555] text-sm max-w-md mx-auto px-4">
                {filters.company !== "All" || filters.role !== "All" || filters.year !== "All" || debouncedSearch
                  ? "Try adjusting your filters or search term to find what you're looking for."
                  : "Start by exploring popular companies or filtering by specific criteria."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PlacementStats;