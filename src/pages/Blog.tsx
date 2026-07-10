import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BlogCard } from "@/components/blog/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem 
} from "@/components/ui/pagination";

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [page, setPage] = useState(1);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts", page],
    queryFn: async () => {
      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .eq("published", true)
        .order("published_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { posts: data || [], totalCount: count || 0 };
    },
  });

  const totalPages = posts ? Math.ceil(posts.totalCount / POSTS_PER_PAGE) : 0;

  return (
    <>
      <SEOHead 
        title="Blog - Career Insights & Success Stories | UdaYantu"
        description="Expert career advice, job search strategies, and inspiring success stories from rural graduates. Learn from industry experts and discover pathways to your dream career with UdaYantu."
        keywords="career advice India, job search tips, rural career success, placement guidance, professional development, career growth stories"
        canonicalUrl={`${window.location.origin}/blog`}
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "UdaYantu Blog",
          "description": "Career insights, success stories, and expert guidance",
          "url": `${window.location.origin}/blog`,
          "publisher": {
            "@type": "Organization",
            "name": "UdaYantu",
            "url": window.location.origin
          }
        }}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Career insights, success stories, and expert guidance to help you achieve your professional goals
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : posts && posts.posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {posts.posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm text-muted-foreground px-4">
                            Page {page} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            Next
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No blog posts available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default Blog;
