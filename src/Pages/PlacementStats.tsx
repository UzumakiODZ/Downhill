import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

// ─── API base ─────────────────────────────────────────────────────────────────
/*
 * In local dev, default to /api so Vite proxy handles CORS.
 * In hosted environments, VITE_API_BASE_URL can point directly to the backend.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn("[PlacementStats] VITE_API_BASE_URL is not set. Using /api (Vite proxy expected in local dev).");
}

const LIMIT = 10;

// ─── useDebounce ─────────────────────────────────────────────────────────────
/*
 * Without debounce, every keystroke fired a fetch (6 requests for "Amazon").
 * 300 ms is a standard UX compromise between responsiveness and server load.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
/*
 * Previously defined inside PlacementStats' render body. React treats inner
 * component definitions as a new component type on every render, causing the
 * dropdown to fully unmount/remount on every state change (e.g. each scroll
 * event), destroying open state and any CSS transitions in flight.
 * Moving it to module scope fixes this permanently.
 */
interface DropdownProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  type: string;
  openDropdown: string | null;
  setOpenDropdown: (v: string | null) => void;
  onChange: (type: string, value: string | number) => void;
}

const Dropdown = ({
  label,
  value,
  options,
  type,
  openDropdown,
  setOpenDropdown,
  onChange,
}: DropdownProps) => (
  <div className="relative">
    <button
      onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
      aria-haspopup="listbox"
      aria-expanded={openDropdown === type}
      className="cursor-pointer w-full md:min-w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] text-white py-2.5 px-4 rounded-lg text-sm text-left transition-all hover:border-[#00e5ff] focus:ring-2 focus:ring-cyan-400/20 outline-none"
    >
      <span className="text-[#888] mr-1">{label}:</span>
      {value}
    </button>

    {openDropdown === type && (
      <ul
        role="listbox"
        className="absolute top-[115%] left-0 w-full md:min-w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {options.map((opt) => (
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
        ))}
      </ul>
    )}
  </div>
);

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── PlacementStats ──────────────────────────────────────────────────────────

const PlacementStats = () => {
  const navigate = useNavigate();

  // ── Paginated list ──────────────────────────────────────────────────────
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  /*
   * hasMoreRef decouples the fetch effect from the hasMore state value.
   * Previously hasMore was both a dependency AND mutated inside the effect,
   * causing a re-run → abort loop on every page load.
   */
  const hasMoreRef = useRef(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Aggregate stats (separate API call — not derived from paginated list) ─
  /*
   * Previously: stats.totalCompanies = new Set(experiences.map(e => e.company)).size
   * This counted companies from the loaded 10-item page, so "Companies: 3"
   * could mean 3 out of 100. Stats must come from a dedicated /stats endpoint.
   */
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Filter option lists (separate API call — not derived from paginated list) ─
  /*
   * Previously: uniqueCompanies = new Set(experiences.map(e => e.company))
   * If "Atlassian" hadn't loaded yet it wouldn't appear in the dropdown.
   * Filter options must come from dedicated /filters/* endpoints.
   */
  const [filterCompanies, setFilterCompanies] = useState<string[]>(["All"]);
  const [filterRoles, setFilterRoles] = useState<string[]>(["All"]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    company: "All",
    role: "All",
    year: "All" as number | "All",
    sort: "newest",
  });

  const [advancedFilters, setAdvancedFilters] = useState({
    minCTC: 0,
    maxCTC: 100,
    minCGPA: 0,
    maxCGPA: 10,
  });

  const [searchQuery, setSearchQuery] = useState("");
  /*
   * debouncedSearch is used in the fetch/reset effects instead of searchQuery
   * directly — prevents hammering the API on every keystroke.
   */
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const availableYears = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - i);
  }, []);

  // Badge count for the Advanced Filters button — makes hidden active filters visible
  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (advancedFilters.minCTC > 0) n++;
    if (advancedFilters.maxCTC < 100) n++;
    if (advancedFilters.minCGPA > 0) n++;
    if (advancedFilters.maxCGPA < 10) n++;
    return n;
  }, [advancedFilters]);

  // ── Fetch aggregate stats once on mount ──────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (!res.ok) throw new Error("Stats fetch failed");
        const data: ApiStats = await res.json();
        setStats(data);
      } catch {
        // Stats failure is non-critical; degrade gracefully to "—"
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ── Fetch filter options once on mount ───────────────────────────────────
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
        // Fail silently; dropdowns will show only "All"
      }
    };
    fetchFilterOptions();
  }, []);

  // ── Intersection observer ─────────────────────────────────────────────────
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        /*
         * Read from hasMoreRef instead of hasMore state to avoid adding
         * hasMore as a dependency (which caused the dep-loop bug).
         */
        if (entries[0].isIntersecting && hasMoreRef.current) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  // ── Reset list when filters/search change ────────────────────────────────
  useEffect(() => {
    setExperiences([]);
    setPage(1);
    setHasMore(true);
    hasMoreRef.current = true;
    setTotalCount(null);
    setError(null);
  }, [filters, advancedFilters, debouncedSearch]);

  // ── Fetch paginated experiences ───────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: LIMIT.toString(),
          sort: filters.sort,
        });

        if (filters.company !== "All") params.append("company", filters.company);
        if (filters.role !== "All")    params.append("role", filters.role);
        if (filters.year !== "All")    params.append("year", filters.year.toString());
        if (debouncedSearch)           params.append("search", debouncedSearch);
        if (advancedFilters.minCTC > 0)   params.append("minCTC", advancedFilters.minCTC.toString());
        if (advancedFilters.maxCTC < 100) params.append("maxCTC", advancedFilters.maxCTC.toString());
        if (advancedFilters.minCGPA > 0)  params.append("minCGPA", advancedFilters.minCGPA.toString());
        if (advancedFilters.maxCGPA < 10) params.append("maxCGPA", advancedFilters.maxCGPA.toString());

        const res = await fetch(`${API_BASE}/experiences?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch experiences. Please try again.");

        // API returns { results: Experience[], total: number }
        const data: { results: Experience[]; total: number } = await res.json();

        setExperiences((prev) =>
          page === 1 ? data.results : [...prev, ...data.results]
        );
        setTotalCount(data.total);

        const moreAvailable = data.results.length === LIMIT;
        setHasMore(moreAvailable);
        hasMoreRef.current = moreAvailable;
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message ?? "Failed to load experiences");
          /*
           * Do NOT setHasMore(false) on error.
           * Previously, a network error permanently killed the scroll observer.
           * Now the user can hit Retry which resets everything cleanly.
           */
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [page, filters, advancedFilters, debouncedSearch]);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((type: string, value: string | number) => {
    setFilters((f) => ({ ...f, [type]: value }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <PopularCompanies />

      {/* Stats Dashboard — data from /stats, not derived from paginated list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-10">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            {(
              [
                { icon: faBriefcase, label: "Total Experiences", value: stats?.totalExperiences },
                { icon: faBuilding,  label: "Companies",         value: stats?.totalCompanies  },
                { icon: faBriefcase, label: "Roles",             value: stats?.uniqueRoles     },
                { icon: faCalendar,  label: "Years",             value: stats?.yearsRepresented },
              ] as const
            ).map(({ icon, label, value }) => (
              <div
                key={label}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#00e5ff]/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={icon} className="text-[#00e5ff] text-sm" />
                  <span className="text-[10px] uppercase tracking-wider text-[#666] font-semibold">
                    {label}
                  </span>
                </div>
                <p className="text-2xl font-bold">{value ?? "—"}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-start mt-12">
        {/* Year Sidebar */}
        <aside className="w-full md:w-44 md:sticky md:top-10 shrink-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-6">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-[#444] px-6 mb-4">
              Filter by Year
            </h3>
            <ul className="flex flex-wrap md:flex-col gap-1 px-4 md:px-0">
              {(["All", ...availableYears] as (number | "All")[]).map((y) => (
                <li
                  key={y}
                  onClick={() => setFilters((f) => ({ ...f, year: y }))}
                  className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 rounded-lg md:rounded-none ${
                    filters.year === y
                      ? "bg-[#00e5ff]/10 text-[#00e5ff]"
                      : "text-[#aaa] hover:bg-[#242424] hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {y === "All" ? "All Time" : y}
                  </span>
                  {filters.year === y && (
                    <FontAwesomeIcon
                      icon={faCircle}
                      className="text-[4px] text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,1)]"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <header className="flex flex-col gap-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Placement Experiences</h2>

              {/*
               * Badge shows count of active advanced filters so users can tell
               * at a glance that the panel is filtering even when it's closed.
               */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all w-fit border ${
                  showAdvancedFilters || activeAdvancedCount > 0
                    ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]"
                    : "bg-[#1e1e1e] border-[#2a2a2a] text-[#888] hover:border-[#00e5ff] hover:text-[#00e5ff]"
                }`}
                aria-label={`Advanced Filters${activeAdvancedCount > 0 ? ` (${activeAdvancedCount} active)` : ""}`}
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

            {/* Search Bar */}
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]"
              />
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search experiences"
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] text-white py-3 px-4 pl-11 rounded-lg text-sm placeholder-[#666] focus:ring-2 focus:ring-[#00e5ff] focus:border-transparent outline-none transition-all hover:border-[#00e5ff]/50"
              />
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#888]">
                    Advanced Filters
                  </h3>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    aria-label="Close advanced filters"
                    className="text-[#666] hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CTC Range */}
                  <div>
                    <label className="text-sm font-medium text-[#aaa] mb-3 block">
                      CTC Range: ₹{advancedFilters.minCTC}L – ₹{advancedFilters.maxCTC}L
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range" min="0" max="100"
                        value={advancedFilters.minCTC}
                        onChange={(e) =>
                          setAdvancedFilters((p) => ({
                            ...p,
                            minCTC: Math.min(Number(e.target.value), p.maxCTC),
                          }))
                        }
                        className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                      />
                      <input
                        type="range" min="0" max="100"
                        value={advancedFilters.maxCTC}
                        onChange={(e) =>
                          setAdvancedFilters((p) => ({
                            ...p,
                            maxCTC: Math.max(Number(e.target.value), p.minCTC),
                          }))
                        }
                        className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                      />
                    </div>
                  </div>

                  {/* CGPA Range */}
                  <div>
                    <label className="text-sm font-medium text-[#aaa] mb-3 block">
                      CGPA Range: {advancedFilters.minCGPA.toFixed(1)} – {advancedFilters.maxCGPA.toFixed(1)}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range" min="0" max="10" step="0.1"
                        value={advancedFilters.minCGPA}
                        onChange={(e) =>
                          setAdvancedFilters((p) => ({
                            ...p,
                            minCGPA: Math.min(Number(e.target.value), p.maxCGPA),
                          }))
                        }
                        className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                      />
                      <input
                        type="range" min="0" max="10" step="0.1"
                        value={advancedFilters.maxCGPA}
                        onChange={(e) =>
                          setAdvancedFilters((p) => ({
                            ...p,
                            maxCGPA: Math.max(Number(e.target.value), p.minCGPA),
                          }))
                        }
                        className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setAdvancedFilters({ minCTC: 0, maxCTC: 100, minCGPA: 0, maxCGPA: 10 })
                  }
                  className="w-full py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#aaa] hover:text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Reset Advanced Filters
                </button>
              </div>
            )}

            {/* Basic Filters — options from /filters/* endpoints, not from loaded list */}
            <div className="flex flex-wrap gap-3" ref={dropdownRef}>
              <Dropdown
                label="Company" value={filters.company} options={filterCompanies} type="company"
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onChange={handleFilterChange}
              />
              <Dropdown
                label="Role" value={filters.role} options={filterRoles} type="role"
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onChange={handleFilterChange}
              />
              <Dropdown
                label="Sort"
                value={filters.sort === "newest" ? "Newest First" : "Oldest First"}
                options={["newest", "oldest"]} type="sort"
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onChange={handleFilterChange}
              />
            </div>
          </header>

          {/* Total count — gives users orientation about how many results exist */}
          {totalCount !== null && (
            <p className="text-sm text-[#555] mb-6">
              Showing{" "}
              <span className="text-[#888] font-medium">{experiences.length}</span>
              {" "}of{" "}
              <span className="text-[#888] font-medium">{totalCount}</span>
              {" "}results
            </p>
          )}

          {/* Experiences Grid */}
          <div className="grid gap-6" role="list" aria-live="polite" aria-label="Placement experiences">
            {/* Initial load skeleton */}
            {loading && page === 1
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : experiences.map((item, index) => (
                  <div
                    ref={experiences.length === index + 1 ? lastElementRef : null}
                    key={item.id}
                    role="listitem"
                    className="transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
                    onClick={() => navigate("/discussion")}
                  >
                    <ExperienceCard {...item} />
                  </div>
                ))}
          </div>

          {/* Pagination loading spinner */}
          {loading && page > 1 && (
            <div className="flex justify-center p-10" role="status" aria-live="polite" aria-label="Loading more">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e5ff]" />
            </div>
          )}

          {/* End of list */}
          {!hasMore && !error && experiences.length > 0 && (
            <p className="text-center mt-12 text-[#444] text-sm font-medium border-t border-[#1a1a1a] pt-8">
              End of list
            </p>
          )}

          {/* Empty state */}
          {experiences.length === 0 && !loading && !error && (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-3xl border border-dashed border-[#2a2a2a]">
              <FontAwesomeIcon icon={faSearch} className="text-[#444] text-4xl mb-4" />
              <p className="text-[#666] text-lg font-medium mb-2">No experiences found</p>
              <p className="text-[#555] text-sm">
                {filters.company !== "All" ||
                filters.role !== "All" ||
                filters.year !== "All" ||
                debouncedSearch
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