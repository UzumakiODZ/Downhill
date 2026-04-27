import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface CompanyCardProps {
  name: string;
  experiences: number;
  type: "Product Based" | "Service Based";
  logo: string;
}

const CompanyCard = ({ name, experiences, type, logo }: CompanyCardProps) => {
  const isProductBased = type === "Product Based";
  const typeStyles = isProductBased
    ? "bg-[#ff7b00]/15 text-[#ff7b00] border-[#ff7b00]/20"
    : "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/20";

  return (
    <div className="group min-w-[200px] bg-[#1e1e1e] p-5 rounded-2xl border border-[#2a2a2a] text-center transition-all duration-300 snap-start hover:border-[#00e5ff] hover:shadow-[0_12px_24px_rgba(0,229,255,0.15)] hover:-translate-y-1 cursor-pointer flex flex-col items-center">

      {/* Logo Container */}
      <div className="w-[55px] h-[55px] bg-[#2a2a2a] rounded-xl mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#333] group-hover:shadow-md border border-white/5 overflow-hidden relative">
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-7 h-7 object-contain drop-shadow-sm"
          loading="lazy"
          onError={(e) => {
            // Hide broken image and reveal the letter-avatar fallback
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/*
         * Letter-avatar fallback — hidden by default, shown via onError above.
         * Clearbit's logo API is deprecated/rate-limited so this fires often.
         */}
        <span
          className="hidden w-full h-full items-center justify-center text-xl font-bold text-[#00e5ff] bg-[#00e5ff]/10 select-none"
          aria-hidden="true"
        >
          {name}
        </span>
      </div>

      {/*
       * CSS `truncate` (overflow-hidden + text-ellipsis + whitespace-nowrap)
       * replaces the canvas-based useTextMeasure hook entirely.
       * `title` shows the full name as a native browser tooltip on hover.
       */}
      <h3
        className="text-lg font-bold text-white tracking-wide transition-colors group-hover:text-[#00e5ff] w-full truncate px-1"
        title={name}
      >
        {name}
      </h3>

      {/* Type Badge */}
      <span
        className={`text-[11px] font-bold px-3 py-1 rounded-full inline-block my-2.5 border uppercase tracking-wider ${typeStyles}`}
      >
        {type}
      </span>

      {/* Experience Count */}
      <p className="text-[13px] text-[#aaa] font-medium mt-auto flex items-center gap-1.5">
        <FontAwesomeIcon
          icon={faCircle}
          className="text-[3px] text-[#555] group-hover:text-[#00e5ff] transition-colors"
        />
        {experiences} Experiences
      </p>
    </div>
  );
};

export default CompanyCard;