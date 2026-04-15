import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CompanyHeader from "../Components/company/CompanyHeader";
import CompanyTabs from "../Components/company/CompanyTabs";
import RolesSection from "../Components/company/RolesSection";
import PostsSection from "../Components/company/PostsSection";
import QuestionsSection from "../Components/company/QuestionsSection";
import CompanyHeaderSkeleton from "../Components/skeleton/CompanyHeaderSkeleton";
import SectionSkeleton from "../Components/skeleton/SectionSkeleton";

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

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  company_id: number;
}

interface Question {
  id: number;
  question: string;
  years: string;
  company_id: number;
}

interface CompanyData {
  id: number;
  company_name: string;
  roles: Role[];
  posts: Post[];
  questions: Question[];
}

export default function CompanyPage() {
  // TODO: extract companyId from route params - later integrate with GraphQL
  const { id } = useParams<{ id: string }>();
  const companyId = parseInt(id || "1", 10);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"roles" | "posts" | "questions">("roles");

  // TODO: fetch company details via GraphQL query
  // query getCompany($id: ID!) {
  //   company(id: $id) {
  //     id
  //     company_name
  //   }
  // }

  // TODO: fetch roles for this company via GraphQL query
  // query getRoles($companyId: ID!) {
  //   roles(companyId: $companyId) {
  //     id
  //     role_name
  //     year
  //     offer_type
  //     cgpa
  //     ctc
  //     base
  //     hired
  //     converted
  //   }
  // }

  // TODO: fetch posts for this company via GraphQL query
  // query getPosts($companyId: ID!) {
  //   posts(companyId: $companyId) {
  //     id
  //     title
  //     content
  //     username
  //     created_at
  //   }
  // }

  // TODO: fetch question bank data via GraphQL query
  // query getQuestions($companyId: ID!) {
  //   questions(companyId: $companyId) {
  //     id
  //     question
  //     years
  //   }
  // }

  // Dummy data for demonstration
  const dummyCompanyData: CompanyData = {
    id: companyId,
    company_name: "Google",
    roles: [
      {
        id: 1,
        role_name: "Software Engineer",
        year: 2024,
        offer_type: "Full-time",
        cgpa: 7.0,
        ctc: 40,
        base: 25,
        hired: 15,
        converted: 12,
        company_id: companyId,
      },
      {
        id: 2,
        role_name: "Internship",
        year: 2024,
        offer_type: "Internship",
        cgpa: 6.5,
        ctc: 2.5,
        base: 0,
        hired: 8,
        converted: 6,
        company_id: companyId,
      },
      {
        id: 3,
        role_name: "Product Manager",
        year: 2023,
        offer_type: "Full-time",
        cgpa: 8.0,
        ctc: 45,
        base: 30,
        hired: 5,
        converted: 4,
        company_id: companyId,
      },
    ],
    posts: [
      {
        id: 1,
        title: "Great experience with the interview",
        content:
          "Had a wonderful experience with the interview process. The interviewers were very supportive and the technical questions were well-structured.",
        username: "John Doe",
        created_at: "2024-04-10T10:30:00Z",
        company_id: companyId,
      },
      {
        id: 2,
        title: "Tips for the coding round",
        content:
          "Focus on writing clean code and explaining your thought process. The interviewers appreciate when you think out loud.",
        username: "Jane Smith",
        created_at: "2024-04-08T15:45:00Z",
        company_id: companyId,
      },
      {
        id: 3,
        title: "Final round experience",
        content:
          "The final round was mostly about culture fit and discussing past projects. Be prepared to talk about your previous experiences.",
        username: "Alex Johnson",
        created_at: "2024-04-05T09:15:00Z",
        company_id: companyId,
      },
    ],
    questions: [
      {
        id: 1,
        question: "What is the difference between let, const, and var in JavaScript?",
        years: "2023, 2024",
        company_id: companyId,
      },
      {
        id: 2,
        question: "Explain the concept of closures in JavaScript.",
        years: "2023, 2024",
        company_id: companyId,
      },
      {
        id: 3,
        question: "Reverse a linked list",
        years: "2024",
        company_id: companyId,
      },
      {
        id: 4,
        question: "Explain React hooks and their lifecycle",
        years: "2023, 2024",
        company_id: companyId,
      },
      {
        id: 5,
        question: "Design a LRU cache",
        years: "2024",
        company_id: companyId,
      },
    ],
  };

  // Simulate loading data from backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // TODO: integrate with Go backend GraphQL API
      // TODO: add WebSocket subscription for live post updates
      // subscription onPostCreated($companyId: ID!) {
      //   postCreated(companyId: $companyId) {
      //     id
      //     title
      //     content
      //     username
      //     created_at
      //   }
      // }
    }, 1500);

    return () => clearTimeout(timer);
  }, [companyId]);

  return (
    <div className="min-h-screen bg-[#121212] text-white py-8 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        {isLoading ? <CompanyHeaderSkeleton /> : <CompanyHeader company={dummyCompanyData} />}

        {/* Tabs Navigation */}
        <CompanyTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-8">
          {isLoading ? (
            <SectionSkeleton lines={6} />
          ) : (
            <>
              {activeTab === "roles" && <RolesSection roles={dummyCompanyData.roles} />}
              {activeTab === "posts" && <PostsSection posts={dummyCompanyData.posts} />}
              {activeTab === "questions" && <QuestionsSection questions={dummyCompanyData.questions} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
