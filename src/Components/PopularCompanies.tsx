import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useQuery} from '@apollo/client/react';
import { gql } from '@apollo/client';
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



// Card width (200px) + gap (16px from gap-4)
const CARD_WIDTH = 216;




const PopularCompanies = () => {
  const navigate = useNavigate();

  // offsetX is the rendered left-shift in pixels, managed via state.
  const offsetRef = useRef(0);
  const [offsetX, setOffsetX] = useState(0);

  // Total width of ONE copy of the list; we wrap at this boundary so the
  // 3-copy array always gives us a card on screen both sides of the seam.
  const totalSingleWidth = 5 ; // 5 cards per copy



  const handleArrow = (direction: "left" | "right") => {
    const delta = direction === "right" ? CARD_WIDTH : -CARD_WIDTH;
    offsetRef.current += delta;
    // Keep within [0, totalSingleWidth) to maintain seamless loop invariant
    if (offsetRef.current < 0) offsetRef.current += totalSingleWidth;
    if (offsetRef.current >= totalSingleWidth) offsetRef.current -= totalSingleWidth;
    setOffsetX(offsetRef.current);
  };

  const { data } = useQuery<GetAllCompaniesQuery>(GET_POPULAR_COMPANIES);

  const companies = useMemo<Company[]>(() => {
    return (data?.getAllCompanies ?? []).map((company, index) => ({
      id: company.id,
      name: company.companyName,
      experiences: 0,
      type: "Product Based",
      logo: `https://cdn.brandfetch.io/domain/${company.companyName
        .toLowerCase()
        .replaceAll(" ", "")}.com?c=${import.meta.env.VITE_IMAGE_URL}`,
    }));
  }, [data]);

  const displayCompanies = useMemo<Company[]>(() => {
    return [...companies, ...companies, ...companies];
  }, [companies]);






  return (
    <div className="mb-[60px]">
      <h2 className="text-2xl font-semibold mb-6 text-white">Popular Companies</h2>

      <div className="relative group w-full">
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex gap-4"
            style={{
              transform: `translateX(-${offsetX}px)`,
              willChange: "transform",
              transition: "transform 0.3s ease-out",
            }}
          >
            {displayCompanies.map((company, index) => (
              <div key={`${company.id}-${index}`} className="flex-shrink-0">
                <CompanyCard
                  {...company}
                  onClick={() => navigate(`/company/${company.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => handleArrow("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/40 text-[#00e5ff] p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-[#00e5ff]/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
        </button>
        <button
          onClick={() => handleArrow("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-[#00e5ff]/20 hover:bg-[#00e5ff]/40 text-[#00e5ff] p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-[#00e5ff]/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PopularCompanies;