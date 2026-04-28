import { useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import CompanyCard from "./CompanyCard";

interface Company {
  id: number;
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
}

interface ApiCompany {
  id: number;
  companyName: string;
}

interface GetAllCompaniesQuery {
  getAllCompanies: ApiCompany[];
}

const GET_POPULAR_COMPANIES = gql`
  query {
    getAllCompanies {
      id
      companyName
    }
  }
`;

const CARD_WIDTH = 216;

const PopularCompanies = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const { data, loading } = useQuery<GetAllCompaniesQuery>(GET_POPULAR_COMPANIES);

 const companies = useMemo<Company[]>(() => {
    return (data?.getAllCompanies ?? []).map((company) => ({
      id: company.id,
      name: company.companyName,
      experiences: 0,
      type: "Product Based",
      logo: `https://cdn.brandfetch.io/domain/${company.companyName
        .toLowerCase()
        .replaceAll(" ", "")}.com?c=${import.meta.env.VITE_IMAGE_URL}`,
    }));
  }, [data]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = direction === "right" ? CARD_WIDTH : -CARD_WIDTH;

    scrollRef.current.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  // Auto scroll
  useEffect(() => {
    if (!scrollRef.current || companies.length === 0) return;

    const el = scrollRef.current;

    const startAutoScroll = () => {
      intervalRef.current = window.setInterval(() => {
        if (!el) return;

        const maxScroll = el.scrollWidth - el.clientWidth;

        if (el.scrollLeft + CARD_WIDTH >= maxScroll) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
        }
      }, 2500);
    };

    const stopAutoScroll = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    startAutoScroll();

    el.addEventListener("mouseenter", stopAutoScroll);
    el.addEventListener("mouseleave", startAutoScroll);

    return () => {
      stopAutoScroll();
      el.removeEventListener("mouseenter", stopAutoScroll);
      el.removeEventListener("mouseleave", startAutoScroll);
    };
  }, [companies]);

  if (loading) {
    return <p className="text-white">Loading...</p>;
  }

  return (
    <div className="mb-[60px]">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Popular Companies
      </h2>

      <div className="flex items-center gap-4">

        {/* Left Button */}
        <button
          onClick={() => scroll("left")}
          className="cursor-pointer hidden md:flex shrink-0 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/40 text-[#00e5ff] w-10 h-10 items-center justify-center rounded-full border border-[#00e5ff]/30"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex-shrink-0 w-[200px] snap-start"
            >
              <CompanyCard
                {...company}
                onClick={() => navigate(`/company/${company.id}`)}
              />
            </div>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={() => scroll("right")}
          className="cursor-pointer hidden md:flex shrink-0 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/40 text-[#00e5ff] w-10 h-10 items-center justify-center rounded-full border border-[#00e5ff]/30"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

      </div>
    </div>
  );
};

export default PopularCompanies;