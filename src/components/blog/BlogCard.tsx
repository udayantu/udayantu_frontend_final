import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  author: string;
  category: string;
  published_at: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/blog/${post.slug}`} className="block">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">{post.title[0]}</span>
          </div>
        )}
      </Link>

      <CardHeader>
        <Badge variant="secondary" className="w-fit mb-2">
          {post.category}
        </Badge>
        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="truncate">{post.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time dateTime={post.published_at}>
            {format(new Date(post.published_at), "MMM d, yyyy")}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
};
