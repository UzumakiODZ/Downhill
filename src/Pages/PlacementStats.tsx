import { useEffect, useRef, useState, useCallback } from "react";
import "../CSS/PlacementStats.css";
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

  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedYear, setSelectedYear] = useState<number | "All">("All");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setExperiences([]);
    setPage(1);
    setHasMore(true);
  }, [selectedCompany, selectedRole, sortOrder, selectedYear]);

  useEffect(() => {
    if (!hasMore) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: LIMIT.toString(),
          sort: sortOrder,
        });

        if (selectedCompany !== "All") params.append("company", selectedCompany);
        if (selectedRole !== "All") params.append("role", selectedRole);
        if (selectedYear !== "All") params.append("year", selectedYear.toString());

        const res = await fetch(`https://your-api.com/experiences?${params}`);
        if (!res.ok) throw new Error("Fetch failed");

        const data: Experience[] = await res.json();
        setExperiences((prev) => (page === 1 ? data : [...prev, ...data]));
        if (data.length < LIMIT) setHasMore(false);
      } catch (err) {
        console.error(err);
        setHasMore(false);
      }
      setLoading(false);
    };

    fetchData();
  }, [page, selectedCompany, selectedRole, sortOrder, selectedYear]);

  const uniqueCompanies = ["All", ...new Set(experiences.map((e) => e.company))];
  const uniqueRoles = ["All", ...new Set(experiences.map((e) => e.role))];

  return (
    <div className="placementContainer">
      <PopularCompanies />

      {/* Flex row: sidebar on left, main content on right */}
      <div className="contentLayout">

        <aside className="yearSidebar">
          <div className="yearSidebarInner">
            <h3 className="yearSidebarTitle">Year</h3>
            <ul className="yearList">
              <li
                className={`yearItem ${selectedYear === "All" ? "active" : ""}`}
                onClick={() => setSelectedYear("All")}
              >
                <span className="yearLabel">All Years</span>
                {selectedYear === "All" && <span className="yearIndicator" />}
              </li>
              {availableYears.map((year) => (
                <li
                  key={year}
                  className={`yearItem ${selectedYear === year ? "active" : ""}`}
                  onClick={() => setSelectedYear(year)}
                >
                  <span className="yearLabel">{year}</span>
                  {selectedYear === year && <span className="yearIndicator" />}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="mainContent">
          <h2 className="sectionTitle">Placement Experiences</h2>

          <div className="filters" ref={dropdownRef}>
            <div className="dropdown">
              <button
                onClick={() => setOpenDropdown(openDropdown === "company" ? null : "company")}
                className="dropdownBtn"
              >
                Company: {selectedCompany}
              </button>
              {openDropdown === "company" && (
                <ul className="dropdownMenu">
                  {uniqueCompanies.map((company) => (
                    <li key={company} onClick={() => { setSelectedCompany(company); setOpenDropdown(null); }}>
                      {company}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dropdown">
              <button
                onClick={() => setOpenDropdown(openDropdown === "role" ? null : "role")}
                className="dropdownBtn"
              >
                Role: {selectedRole}
              </button>
              {openDropdown === "role" && (
                <ul className="dropdownMenu">
                  {uniqueRoles.map((role) => (
                    <li key={role} onClick={() => { setSelectedRole(role); setOpenDropdown(null); }}>
                      {role}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dropdown">
              <button
                onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
                className="dropdownBtn"
              >
                Sort: {sortOrder}
              </button>
              {openDropdown === "sort" && (
                <ul className="dropdownMenu">
                  <li onClick={() => { setSortOrder("newest"); setOpenDropdown(null); }}>Newest First</li>
                  <li onClick={() => { setSortOrder("oldest"); setOpenDropdown(null); }}>Oldest First</li>
                </ul>
              )}
            </div>
          </div>

          {experiences.map((item, index) => {
            if (experiences.length === index + 1) {
              return (
                <div ref={lastElementRef} key={item.id}>
                  <ExperienceCard {...item} />
                </div>
              );
            }
            return <ExperienceCard key={item.id} {...item} />;
          })}

          {loading && <p className="loadingText">Loading...</p>}
          {!hasMore && <p className="endText">No more experiences</p>}
        </main>

      </div>
    </div>
  );
};

export default PlacementStats;