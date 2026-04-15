import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface ExperienceCardProps {
  company: string;
  role: string;
  candidate: string;
  date: string;
  tags?: string[];
}

const ExperienceCard = ({
  company,
  role,
  candidate,
  date,
  tags = [],
}: ExperienceCardProps) => {
  return (
    <div className="group relative bg-[#1e1e1e] p-6 rounded-2xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00e5ff] hover:shadow-[0_12px_30px_rgba(0,229,255,0.12)] cursor-pointer">

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start gap-3 min-w-0">
          {/*
           * CSS truncation replaces the canvas-based useTextMeasure hook.
           * `truncate` = overflow-hidden + text-ellipsis + whitespace-nowrap.
           * `title` provides the full text on hover as a native tooltip.
           */}
          <h3
            className="text-xl font-bold text-white tracking-tight group-hover:text-[#00e5ff] transition-colors duration-300 flex-1 truncate min-w-0"
            title={company}
          >
            {company}
          </h3>
          <span className="bg-[#00e5ff]/10 text-[#00e5ff] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm border border-[#00e5ff]/20 whitespace-nowrap shrink-0">
            {role}
          </span>
        </div>

        <p className="mt-4 text-sm text-[#ccc]">
          Shared by{" "}
          <span
            className="text-white font-semibold truncate max-w-[280px] inline-block align-bottom"
            title={candidate}
          >
            {candidate}
          </span>
        </p>

        <p className="text-[13px] text-[#666] mt-1.5 flex items-center gap-2">
          <FontAwesomeIcon icon={faCircle} className="text-[2px] text-[#555]" />
          {date}
        </p>

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-[#242424] border border-[#2a2a2a] text-[#888] px-3 py-1 rounded-lg text-[11px] font-medium transition-all group-hover:border-[#3a3a3a] group-hover:text-[#aaa]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;