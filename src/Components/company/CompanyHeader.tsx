interface CompanyData {
  id: number;
  company_name: string;
  roles: { id: number }[];
  posts: { id: number }[];
  questions: { id: number }[];
}

interface CompanyHeaderProps {
  data: CompanyData;
}

export default function CompanyHeader({ data }: CompanyHeaderProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-8 mb-8 border border-[#2a2a2a]">
      <div className="flex items-start gap-6">
        {/* Company Logo Placeholder */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#00e5ff] to-[#0099cc] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00e5ff]/20">
          <span className="text-2xl font-bold text-[#121212]">{data.company_name.charAt(0)}</span>
        </div>

        {/* Company Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2">{data.company_name}</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-3xl font-bold text-[#00e5ff]">{data.roles.length}</div>
              <div className="text-[#888] text-sm mt-1">Roles Available</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-3xl font-bold text-[#00e5ff]">{data.posts.length}</div>
              <div className="text-[#888] text-sm mt-1">Discussion Posts</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-3xl font-bold text-[#00e5ff]">{data.questions.length}</div>
              <div className="text-[#888] text-sm mt-1">Interview Questions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
