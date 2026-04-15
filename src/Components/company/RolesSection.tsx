interface Role {
  id: number;
  role_name: string;
  year: number;
  offer_type: "Internship" | "Full-time" | "Contract";
  cgpa: number;
  ctc?: number;
  base?: number;
  hired: number;
  converted: number;
  company_id: number;
}

interface RolesSectionProps {
  roles: Role[];
}

export default function RolesSection({ roles }: RolesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <div
          key={role.id}
          className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#00e5ff] hover:shadow-lg hover:shadow-[#00e5ff]/20 transition-all duration-300"
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">{role.role_name}</h3>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-block px-3 py-1 bg-[#00e5ff]/20 text-[#00e5ff] rounded text-xs font-medium">
                {role.offer_type}
              </span>
              <span className="inline-block px-3 py-1 bg-[#a855f7]/20 text-[#a855f7] rounded text-xs font-medium">
                {role.year}
              </span>
            </div>
          </div>

          {/* Main Details */}
          <div className="space-y-3 mb-5 pb-5 border-b border-[#2a2a2a]">
            <div className="flex justify-between">
              <span className="text-[#888] text-sm">CTC</span>
              <span className="text-white font-semibold">
                {role.ctc ? `₹${role.ctc}L` : "N/A"}
              </span>
            </div>

            {role.offer_type === "Full-time" && (
              <div className="flex justify-between">
                <span className="text-[#888] text-sm">Base Salary</span>
                <span className="text-white font-semibold">
                  {role.base ? `₹${role.base}L` : "N/A"}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#888] text-sm">Min CGPA</span>
              <span className="text-white font-semibold">{role.cgpa.toFixed(1)}</span>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2a2a2a] rounded p-3">
              <div className="text-[#00e5ff] font-bold text-lg">{role.hired}</div>
              <div className="text-[#666] text-xs">Hired</div>
            </div>
            <div className="bg-[#2a2a2a] rounded p-3">
              <div className="text-[#a855f7] font-bold text-lg">{role.converted}</div>
              <div className="text-[#666] text-xs">Converted</div>
            </div>
          </div>

          {/* TODO: Add GraphQL mutation placeholder for applying to role */}
          {/* TODO: mutation applyRole($roleId: ID!, $userId: ID!) {
            //   applyForRole(roleId: $roleId, userId: $userId) {
            //     id
            //     status
            //   }
            // }
          */}
        </div>
      ))}
    </div>
  );
}
