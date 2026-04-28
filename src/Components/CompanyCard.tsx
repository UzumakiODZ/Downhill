import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface CompanyCardProps {
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
  onClick?: () => void;
}

const CompanyCard = ({
  name,
  experiences,
  type,
  logo,
  onClick,
}: CompanyCardProps) => {
  const isProductBased = type === "Product Based";

  const typeStyles = isProductBased
    ? "text-[#ff7b00]"
    : "text-[#a855f7]";

  return (
    <div
      onClick={onClick}
      className="group bg-[#1c1c1c] p-5 rounded-2xl text-center cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] flex flex-col items-center"
    >
      {/* Logo */}
      <div className="w-[60px] h-[60px] rounded-xl mb-4 flex items-center justify-center bg-[#2a2a2a] overflow-hidden">
        <img
          src={logo}
          alt={name}
          className="w-8 h-8 object-contain"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* Name */}
      <h3
        className="text-base font-semibold text-white truncate w-full"
        title={name}
      >
        {name}
      </h3>

      {/* Type */}
      <p className={`text-xs mt-1 ${typeStyles}`}>
        {type}
      </p>

      {/* Experiences */}
      <p className="text-xs text-[#888] mt-2 flex items-center gap-1">
        <FontAwesomeIcon icon={faCircle} className="text-[4px]" />
        {experiences} Experiences
      </p>
    </div>
  );
};

export default CompanyCard;