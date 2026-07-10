-- Fix blog_posts RLS policies to restrict management to admins only

-- Drop the insecure policy that allows any authenticated user to manage blog posts
DROP POLICY IF EXISTS "Authenticated users can manage blog posts" ON blog_posts;

-- Add admin-only management policies
CREATE POLICY "Admins can manage all blog posts"
ON blog_posts 
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Ensure the existing public read policy for published posts remains
-- (Already exists: "Published blog posts are viewable by everyone")