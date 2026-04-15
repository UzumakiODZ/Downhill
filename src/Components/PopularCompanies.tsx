import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import CompanyCard from "./CompanyCard";

interface Company {
  id: number;
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
}

const baseCompanies: Company[] = [
  { id: 1, name: "Amazon",    experiences: 51, type: "Product Based", logo: "https://logo.clearbit.com/amazon.com"    },
  { id: 2, name: "Microsoft", experiences: 30, type: "Product Based", logo: "https://logo.clearbit.com/microsoft.com" },
  { id: 3, name: "Google",    experiences: 21, type: "Product Based", logo: "https://logo.clearbit.com/google.com"    },
  { id: 4, name: "Uber",      experiences: 11, type: "Product Based", logo: "https://logo.clearbit.com/uber.com"      },
];

// Card width (200px) + gap (16px from gap-4)
const CARD_WIDTH = 216;

const PopularCompanies = () => {
  // offsetX is the rendered left-shift in pixels, managed via state.
  const offsetRef = useRef(0);
  const [offsetX, setOffsetX] = useState(0);

  // Total width of ONE copy of the list; we wrap at this boundary so the
  // 3-copy array always gives us a card on screen both sides of the seam.
  const totalSingleWidth = baseCompanies.length * CARD_WIDTH;



  const handleArrow = (direction: "left" | "right") => {
    const delta = direction === "right" ? CARD_WIDTH : -CARD_WIDTH;
    offsetRef.current += delta;
    // Keep within [0, totalSingleWidth) to maintain seamless loop invariant
    if (offsetRef.current < 0) offsetRef.current += totalSingleWidth;
    if (offsetRef.current >= totalSingleWidth) offsetRef.current -= totalSingleWidth;
    setOffsetX(offsetRef.current);
  };

  // 3 copies so there is always a full screen of cards available on both sides
  const displayCompanies = [...baseCompanies, ...baseCompanies, ...baseCompanies];

  return (
    <div className="mb-[60px]">
      <h2 className="text-2xl font-semibold mb-6 text-white">Popular Companies</h2>

      <div className="relative group w-full">
        <div className="overflow-visible rounded-xl">
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
                <CompanyCard {...company} />
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