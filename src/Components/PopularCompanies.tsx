
import { useRef } from "react";
import CompanyCard from "./CompanyCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface Company {
  id: number;
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
}
const companies: Company[] = [
  {
    id: 1,
    name: "Amazon",
    experiences: 51,
    type: "Product Based",
    logo: "https://logo.clearbit.com/amazon.com",
  },
  {
    id: 2,
    name: "Microsoft",
    experiences: 30,
    type: "Product Based",
    logo: "https://logo.clearbit.com/microsoft.com",
  },
  {
    id: 3,
    name: "Google",
    experiences: 21,
    type: "Product Based",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    id: 4,
    name: "Uber",
    experiences: 11,
    type: "Product Based",
    logo: "https://logo.clearbit.com/uber.com",
  },
  {
    id: 1,
    name: "Amazon",
    experiences: 51,
    type: "Product Based",
    logo: "https://logo.clearbit.com/amazon.com",
  },
  {
    id: 2,
    name: "Microsoft",
    experiences: 30,
    type: "Product Based",
    logo: "https://logo.clearbit.com/microsoft.com",
  },
  {
    id: 3,
    name: "Google",
    experiences: 21,
    type: "Product Based",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    id: 4,
    name: "Uber",
    experiences: 11,
    type: "Product Based",
    logo: "https://logo.clearbit.com/uber.com",
  },
  {
    id: 1,
    name: "Amazon",
    experiences: 51,
    type: "Product Based",
    logo: "https://logo.clearbit.com/amazon.com",
  },
  {
    id: 2,
    name: "Microsoft",
    experiences: 30,
    type: "Product Based",
    logo: "https://logo.clearbit.com/microsoft.com",
  },
  {
    id: 3,
    name: "Google",
    experiences: 21,
    type: "Product Based",
    logo: "https://logo.clearbit.com/google.com",
  },
  {
    id: 4,
    name: "Uber",
    experiences: 11,
    type: "Product Based",
    logo: "https://logo.clearbit.com/uber.com",
  },
];

// ... (companies array remains the same)

const PopularCompanies = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 350;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-[60px]">
      <h2 className="text-2xl font-semibold m-2.5 text-white">
        Popular Companies
      </h2>

      <div className="flex items-center gap-[15px]">
        {/* Left Arrow */}
        <button 
          className="hidden md:block bg-[#1e1e1e] border border-[#2a2a2a] text-white p-3 rounded-xl cursor-pointer transition-all duration-300 hover:border-[#00e5ff] hover:text-[#00e5ff] hover:scale-105 active:scale-95 shrink-0"
          onClick={() => scroll("left")}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Scroll Container */}
        <div 
          className="flex gap-[15px] overflow-x-auto overflow-y-visible scroll-smooth py-[15px] flex-1 no-scrollbar selection:bg-transparent" 
          ref={scrollRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Support for Firefox/IE
        >
          {companies.map((company, index) => (
            // Added a wrapper to ensure cards don't shrink
            <div key={`${company.id}-${index}`} className="flex-shrink-0">
              <CompanyCard {...company} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          className="hidden md:block bg-[#1e1e1e] border border-[#2a2a2a] text-white p-3 rounded-xl cursor-pointer transition-all duration-300 hover:border-[#00e5ff] hover:text-[#00e5ff] hover:scale-105 active:scale-95 shrink-0"
          onClick={() => scroll("right")}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default PopularCompanies;