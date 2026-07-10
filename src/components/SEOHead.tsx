import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article";
  ogImage?: string | null;
  noIndex?: boolean;
  structuredData?: object;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage,
  noIndex = false,
  structuredData,
}: SEOHeadProps) => {
  const siteUrl = window.location.origin;
  const defaultImage = `${siteUrl}/opengraph-image.png`;
  const imageUrl = ogImage || defaultImage;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="UdaYantu" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl || siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@UdaYantu" />
      
      {/* RSS Feed Link */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="UdaYantu Blog RSS Feed"
        href={`${siteUrl}/rss.xml`}
      />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
