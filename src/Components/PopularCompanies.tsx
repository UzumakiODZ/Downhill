import { useRef, useState } from "react";
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
  companyName: string;
}

interface GetAllCompaniesQuery {
  getAllCompanies: ApiCompany[];
}

const GET_POPULAR_COMPANIES = gql`
  query {
    getAllCompanies {
      companyName
    }
  }
`;

// Card width (200px) + gap (16px from gap-4)
const CARD_WIDTH = 216;

const baseCompanies: Company[] = [
  {
    id: 1,
    name: "Google",
    experiences: 234,
    type: "Product Based",
    logo: "https://via.placeholder.com/200x100?text=Google",
  },
  {
    id: 2,
    name: "Amazon",
    experiences: 189,
    type: "Product Based",
    logo: "https://via.placeholder.com/200x100?text=Amazon",
  },
  {
    id: 3,
    name: "Microsoft",
    experiences: 176,
    type: "Product Based",
    logo: "https://via.placeholder.com/200x100?text=Microsoft",
  },
  {
    id: 4,
    name: "Apple",
    experiences: 145,
    type: "Product Based",
    logo: "https://via.placeholder.com/200x100?text=Apple",
  },
  {
    id: 5,
    name: "Meta",
    experiences: 128,
    type: "Product Based",
    logo: "https://via.placeholder.com/200x100?text=Meta",
  },
  {
    id: 6,
    name: "Accenture",
    experiences: 156,
    type: "Service Based",
    logo: "https://via.placeholder.com/200x100?text=Accenture",
  },
];


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

  // 3 copies so there is always a full screen of cards available on both sides
  const displayCompanies = useState([]);






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