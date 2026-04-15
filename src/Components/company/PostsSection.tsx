import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faThumbsUp, faComment as faCommentIcon, faShare } from "@fortawesome/free-solid-svg-icons";

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  company_id: number;
}

interface PostsSectionProps {
  posts: Post[];
}

export default function PostsSection({ posts }: PostsSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <button className="w-full bg-[#00e5ff] hover:bg-[#00d9ff] text-[#121212] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
        <FontAwesomeIcon icon={faPen} className="text-sm" />
        Create a Post
      </button>

      {/* Posts List */}
      <div className="space-y-4 mt-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#00e5ff] hover:shadow-lg hover:shadow-[#00e5ff]/10 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-lg group-hover:text-[#00e5ff] transition-colors">
                  {post.title}
                </h3>
                <div className="flex gap-2 mt-2 text-sm">
                  <span className="text-[#00e5ff] font-medium">{post.username}</span>
                  <span className="text-[#666]">•</span>
                  <span className="text-[#666]">{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <p className="text-[#aaa] leading-relaxed line-clamp-3">
              {post.content}
            </p>

            {/* Footer */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-[#2a2a2a]">
              <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
                <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />
                Like
              </button>
              <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
                <FontAwesomeIcon icon={faCommentIcon} className="text-xs" />
                Reply
              </button>
              <button className="text-[#666] hover:text-[#00e5ff] text-sm transition-colors flex items-center gap-1">
                <FontAwesomeIcon icon={faShare} className="text-xs" />
                Share
              </button>
            </div>

            {/* TODO: GraphQL query to fetch full post details and comments
              // query getPost($postId: ID!) {
              //   post(id: $postId) {
              //     id
              //     title
              //     content
              //     username
              //     created_at
              //     comments {
              //       id
              //       content
              //       username
              //       created_at
              //     }
              //     likes
              //   }
              // }
            */}

            {/* TODO: GraphQL mutation for creating comments
              // mutation createComment($postId: ID!, $content: String!, $userId: ID!) {
              //   createComment(postId: $postId, content: $content, userId: $userId) {
              //     id
              //     content
              //     username
              //     created_at
              //   }
              // }
            */}
          </div>
        ))}
      </div>

      {/* TODO: GraphQL subscription for real-time post updates
        // subscription onNewPost($companyId: ID!) {
        //   newPost(companyId: $companyId) {
        //     id
        //     title
        //     content
        //     username
        //     created_at
        //   }
        // }
      */}
    </div>
  );
}
