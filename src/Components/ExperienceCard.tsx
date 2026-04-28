import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

interface ExperienceCardProps {
  company: string;
  role: string;
  candidate: string;
  date: string;
  tags?: string[];
  ctc?: number;
  cgpa?: number;
}

const ExperienceCard = ({
  company,
  role,
  candidate,
  date,
  tags = [],
  ctc,
  cgpa,
}: ExperienceCardProps) => {
  return (
    <div className="group relative flex flex-col h-full bg-[#1e1e1e] p-5 sm:p-6 rounded-2xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00e5ff] hover:shadow-[0_12px_30px_rgba(0,229,255,0.12)] cursor-pointer overflow-hidden">
      
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header: Stacks on tiny screens, inline on larger screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 min-w-0">
          <h3
            className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-[#00e5ff] transition-colors duration-300 line-clamp-2"
            title={company}
          >
            {company}
          </h3>
          
          {/* Role badge: allowed to truncate if ridiculously long */}
          <span
            className="self-start sm:shrink-0 max-w-full bg-[#00e5ff]/10 text-[#00e5ff] px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm border border-[#00e5ff]/20 truncate"
            title={role}
          >
            {role}
          </span>
        </div>

        {/* Stats Row (if data exists) */}
        {(ctc || cgpa) && (
          <div className="flex gap-4 mb-4">
            {ctc && (
              <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">CTC</span>
                <span className="text-sm text-white font-semibold">{ctc} LPA</span>
              </div>
            )}
            {cgpa && (
              <div className="bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-1.5 flex flex-col">
                <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">CGPA</span>
                <span className="text-sm text-white font-semibold">{cgpa}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto">
          {/* Candidate Name: dynamic truncation */}
          <p className="text-sm text-[#ccc] flex items-center min-w-0">
            <span className="shrink-0 mr-1">Shared by</span>
            <span className="text-white font-semibold truncate" title={candidate}>
              {candidate}
            </span>
          </p>

          <p className="text-[12px] text-[#666] mt-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faCircle} className="text-[4px] text-[#444]" />
            {date}
          </p>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-[#242424] border border-[#2a2a2a] text-[#888] px-2.5 py-1 rounded-md text-[10px] font-medium transition-all group-hover:border-[#3a3a3a] group-hover:text-[#aaa]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;