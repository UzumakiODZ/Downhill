import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ExperienceCard from "../Components/ExperienceCard";
import PopularCompanies from "../Components/PopularCompanies.tsx";

interface Experience {
  id: number;
  company: string;
  role: string;
  candidate: string;
  date: string;
  tags?: string[];
  year?: number;
}

const LIMIT = 10;

const PlacementStats = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Consolidated Filters
  const [filters, setFilters] = useState({
    company: "All",
    role: "All",
    year: "All" as number | "All",
    sort: "newest",
  });

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  // Intersection Observer Logic
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Click Outside to close dropdowns
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset when filters change
  useEffect(() => {
    setExperiences([]);
    setPage(1);
    setHasMore(true);
  }, [filters]);

  // Fetch Logic with Race Condition Protection
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (!hasMore && page !== 1) return;
      
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

        const res = await fetch(`https://your-api.com/experiences?${params}`, {
          signal: controller.signal
        });
        
        if (!res.ok) throw new Error("Fetch failed");

        const data: Experience[] = await res.json();
        
        setExperiences((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length === LIMIT);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("API Error:", err);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort(); // Cancel request if component unmounts or deps change
  }, [page, filters]);

  // Derived Data
  const uniqueCompanies = useMemo(() => ["All", ...new Set(experiences.map((e) => e.company))], [experiences]);
  const uniqueRoles = useMemo(() => ["All", ...new Set(experiences.map((e) => e.role))], [experiences]);

  // Dropdown UI Helper
  const Dropdown = ({ label, value, options, type }: { label: string, value: any, options: any[], type: string }) => (
    <div className="relative">
      <button
        onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
        className="cursor-pointer w-full md:min-w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] text-white py-2.5 px-4 rounded-lg text-sm text-left transition-all hover:border-[#00e5ff] focus:ring-2 focus:ring-cyan-400/20"
      >
        <span className="text-[#888] mr-1">{label}:</span> {value}
      </button>
      {openDropdown === type && (
        <ul className="absolute top-[115%] left-0 w-full md:min-w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <li 
              key={opt} 
              onClick={() => { setFilters(f => ({ ...f, [type]: opt })); setOpenDropdown(null); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#2a2a2a] ${value === opt ? "text-[#00e5ff] bg-[#00e5ff]/5" : "text-[#ccc]"}`}
            >
              {opt === "newest" ? "Newest First" : opt === "oldest" ? "Oldest First" : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 md:p-10">
      <PopularCompanies />

      <div className="flex flex-col md:flex-row gap-10 items-start mt-12">
        {/* Year Sidebar */}
        <aside className="w-full md:w-44 md:sticky md:top-10 shrink-0">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl py-6">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-[#444] px-6 mb-4">
              Filter by Year
            </h3>
            <ul className="flex flex-wrap md:flex-col gap-1 px-4 md:px-0">
              {["All", ...availableYears].map((y) => (
                <li
                  key={y}
                  onClick={() => setFilters(f => ({ ...f, year: y as any }))}
                  className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all duration-200 group rounded-lg md:rounded-none ${
                    filters.year === y ? "bg-[#00e5ff]/10 text-[#00e5ff]" : "text-[#aaa] hover:bg-[#242424] hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{y === "All" ? "All Time" : y}</span>
                  {filters.year === y && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Placement Experiences</h2>
            
            <div className="flex flex-wrap gap-3" ref={dropdownRef}>
              <Dropdown label="Company" value={filters.company} options={uniqueCompanies} type="company" />
              <Dropdown label="Role" value={filters.role} options={uniqueRoles} type="role" />
              <Dropdown label="Sort" value={filters.sort === "newest" ? "Newest First" : "Oldest First"} options={["newest", "oldest"]} type="sort" />
            </div>
          </header>

          <div className="grid gap-6">
            {experiences.map((item, index) => (
              <div 
                ref={experiences.length === index + 1 ? lastElementRef : null} 
                key={item.id}
                className="transform transition-transform duration-300 hover:scale-[1.01]"
              >
                <ExperienceCard {...item} />
              </div>
            ))}
          </div>

          {loading && (
             <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00e5ff]"></div>
             </div>
          )}
          
          {!hasMore && experiences.length > 0 && (
            <p className="text-center mt-12 text-[#444] text-sm font-medium border-t border-[#1a1a1a] pt-8">
              End of list
            </p>
          )}

          {experiences.length === 0 && !loading && (
            <div className="text-center py-20 bg-[#1a1a1a] rounded-3xl border border-dashed border-[#2a2a2a]">
              <p className="text-[#666]">No experiences found matching these filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PlacementStats;