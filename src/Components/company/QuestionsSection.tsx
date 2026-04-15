import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBookmark, faLink } from "@fortawesome/free-solid-svg-icons";

interface Question {
  id: number;
  question: string;
  years: string;
  company_id: number;
}

interface QuestionsSectionProps {
  questions: Question[];
}

export default function QuestionsSection({ questions }: QuestionsSectionProps) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#00e5ff] hover:shadow-lg hover:shadow-[#00e5ff]/10 transition-all cursor-pointer group"
        >
          {/* Question Text */}
          <h3 className="text-white font-semibold text-lg group-hover:text-[#00e5ff] transition-colors mb-3 leading-relaxed">
            {q.question}
          </h3>

          {/* Year Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {q.years.split(",").map((year, idx) => (
              <span
                key={idx}
                className="inline-block px-3 py-1 bg-[#a855f7]/20 text-[#a855f7] rounded text-xs font-medium"
              >
                {year.trim()}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[#2a2a2a]">
            <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
              View Solutions
            </button>
            <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
              <FontAwesomeIcon icon={faBookmark} className="text-xs" />
              Save
            </button>
            <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
              <FontAwesomeIcon icon={faLink} className="text-xs" />
              Share
            </button>
          </div>

          {/* TODO: GraphQL query to fetch solutions and discussions for this question
            // query getQuestionDetails($questionId: ID!) {
            //   question(id: $questionId) {
            //     id
            //     question
            //     years
            //     solutions {
            //       id
            //       content
            //       author
            //       likes
            //     }
            //     discussions {
            //       id
            //       comment
            //       author
            //       created_at
            //     }
            //   }
            // }
          */}
        </div>
      ))}

      {/* TODO: GraphQL query to fetch question bank filtered by difficulty and topic
        // query getQuestionBank($companyId: ID!, $difficulty: String, $topic: String) {
        //   questionBank(companyId: $companyId, difficulty: $difficulty, topic: $topic) {
        //     id
        //     question
        //     years
        //     difficulty
        //     topic
        //   }
        // }
      */}
    </div>
  );
}
