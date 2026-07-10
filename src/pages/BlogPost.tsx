import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", data.id);

      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <article className="container mx-auto px-4 py-16 max-w-4xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </article>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const postUrl = `${window.location.origin}/blog/${post.slug}`;

  return (
    <>
      <SEOHead 
        title={`${post.meta_title || post.title} | UdaYantu Blog`}
        description={post.meta_description || post.excerpt}
        keywords={post.tags?.join(", ") || "career advice, job placement, professional development"}
        canonicalUrl={postUrl}
        ogType="article"
        ogImage={post.featured_image}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": post.featured_image,
          "datePublished": post.published_at,
          "dateModified": post.updated_at,
          "author": {
            "@type": "Person",
            "name": post.author,
          },
          "publisher": {
            "@type": "Organization",
            "name": "UdaYantu",
            "url": window.location.origin,
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/favicon.ico`
            }
          },
          "description": post.excerpt,
          "articleBody": post.content,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
          }
        }}
      />

      <main className="min-h-screen bg-background">
        <Navbar />
        
        <article className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>

          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              {post.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-6">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </time>
              </div>
            </div>

            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                loading="lazy"
              />
            )}
          </header>

          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          <div className="border-t border-border pt-8 mb-12">
            <ShareButtons url={postUrl} title={post.title} />
          </div>

          <RelatedPosts currentPostId={post.id} category={post.category} />
        </article>

        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default BlogPost;
