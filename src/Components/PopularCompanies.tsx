import { useRef } from "react";
import CompanyCard from "./CompanyCard";
import "../CSS/PopularCompanies.css";
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
    <div className="popularSection">
      <h2 className="sectionTitle">Popular Companies</h2>

      <div className="scrollWrapper">
        <button className="arrowBtn" onClick={() => scroll("left")}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <div className="companyScroll" ref={scrollRef}>
          {companies.map((company) => (
            <CompanyCard key={company.id} {...company} />
          ))}
        </div>

        <button className="arrowBtn" onClick={() => scroll("right")}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default PopularCompanies;