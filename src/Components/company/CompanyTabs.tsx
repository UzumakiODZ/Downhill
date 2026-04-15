import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faComment, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

interface CompanyTabsProps {
  activeTab: "roles" | "posts" | "questions";
  setActiveTab: (tab: "roles" | "posts" | "questions") => void;
}

export default function CompanyTabs({ activeTab, setActiveTab }: CompanyTabsProps) {
  const tabs = [
    { id: "roles", label: "Roles & Placements", icon: faBriefcase },
    { id: "posts", label: "Discussion", icon: faComment },
    { id: "questions", label: "Interview Questions", icon: faQuestionCircle },
  ] as const;

  return (
    <div className="border-b border-[#2a2a2a] mt-8">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "roles" | "posts" | "questions")}
            className={`px-4 py-4 font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-[#00e5ff] border-b-2 border-[#00e5ff]"
                : "text-[#666] hover:text-[#aaa]"
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} className="text-xs" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
