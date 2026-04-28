import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import CompanyTabs from "../Components/company/CompanyTabs";
import RolesSection from "../Components/company/RolesSection";
import PostsSection from "../Components/company/PostsSection";
import CompanyHeaderSkeleton from "../Components/skeleton/CompanyHeaderSkeleton";
import SectionSkeleton from "../Components/skeleton/SectionSkeleton";
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

interface ApiRole {
  id: number;
  roleName: string;
  year: number;
  offerType: "Internship" | "Full-time" | "Contract";
  cgpa: number;
  ctc?: number;
  base?: number;
  hired: number;
  converted: number;
  companyId: number;
}

interface ApiQuestion {
  id: number;
  question: string;
  years: string;
  companyId: number;
}

interface ApiPost {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt: string;
  user: {
    username: string;
  };
}

interface CompanyName {
  companyName: string;
}

interface CompanyPageQuery {
  getComapanyByID: CompanyName;
  roles: ApiRole[];
  questions: ApiQuestion[];
  posts: ApiPost[];
}

const GET_COMPANY_PAGE_DATA = gql`
  query CompanyPageData($companyId: ID!) {
    getCompanyByID(companyId: $companyId){
      companyName
    }
    roles: getRolesByCompany(companyId: $companyId) {
      id
      roleName
      year
      offerType
      cgpa
      ctc
      base
      hired
      converted
      companyId
    }
    questions: getQuestionsByCompany(companyId: $companyId) {
      id
      question
      years
      companyId
    }
    posts: getAllPosts {
      id
      title
      content
      userId
      createdAt
      user {
        username
      }
    }
  }
`;


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
  id: string;
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
  const { id } = useParams<{ id: string }>();
  const companyId = Number.parseInt(id || "1", 10);

  const [activeTab, setActiveTab] = useState<"roles" | "posts" | "questions">("roles");

  const { loading, error, data } = useQuery<CompanyPageQuery>(GET_COMPANY_PAGE_DATA, {
    variables: { companyId: String(companyId) },
  });

  const comp = useMemo<CompanyData | null>(() => {
    if (!data) {
      return null;
    }

    const companyName =
      data.getComapanyByID?.companyName ?? `Company ${companyId}`;

    return {
      id: companyId,
      company_name: companyName,
      roles: (data.roles ?? []).map((role) => ({
      id: role.id,
      role_name: role.roleName,
      year: role.year,
      offer_type: role.offerType,
      cgpa: role.cgpa,
      ctc: role.ctc,
      base: role.base,
      hired: role.hired,
      converted: role.converted,
      company_id: role.companyId,
    })),
      posts: (data.posts ?? []).map((post: ApiPost) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        username: post.user?.username ?? `User ${post.userId}`,
        created_at: post.createdAt,
        company_id: companyId,
      })),
      questions: (data.questions ?? []).map((question: ApiQuestion) => ({
        id: question.id,
        question: question.question,
        years: question.years,
        company_id: question.companyId,
      })),
    };
  }, [companyId, data]);

  let tabContent;
  if (loading) {
    tabContent = <SectionSkeleton lines={6} />;
  } else if (error) {
    tabContent = (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        Failed to load company details.
      </div>
    );
  } else {
    tabContent = (
      <>
        {activeTab === "roles" && comp && <RolesSection roles={comp.roles} />}
        {activeTab === "posts" && comp && <PostsSection posts={comp.posts} />}
      </>
    );
  }


  return (
    <div className="min-h-screen bg-[#121212] text-white py-8 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        {loading || !companyId ? (
          <CompanyHeaderSkeleton />
        ) : (
          <></>
        )}

        {/* Tabs Navigation */}
        <CompanyTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-8">
          {tabContent}
        </div>
      </div>
    </div>
  );
}
