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
}

const LIMIT = 10;

const PlacementStats = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `https://your-api.com/experiences?page=${page}&limit=${LIMIT}`
        );
        const data: Experience[] = await res.json();

        if (data.length < LIMIT) {
          setHasMore(false);
        }

        setExperiences((prev) => [...prev, ...data]);
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchData();
  }, [page]);

  return (
    <div className="placementContainer">

      {/* 🔥 Popular Companies Section */}
      <PopularCompanies />

      {/* 🔥 Experiences Section */}
      <h2 className="sectionTitle">Placement Experiences</h2>

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
    </div>
  );
};

export default PlacementStats;