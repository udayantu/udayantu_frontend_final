/**
 * SEO Utilities for JSON-LD Structured Data
 * Helps search engines understand page content better
 */

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Organization Schema
 */
export const organizationSchema: StructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'UdaYantu',
  url: 'https://udayantu.com',
  logo: 'https://udayantu.com/favicon.png',
  description: 'Career development platform for rural Indian graduates with job placement guarantee',
  sameAs: [
    'https://www.facebook.com/udayantu',
    'https://twitter.com/udayantu',
    'https://www.linkedin.com/company/udayantu',
    'https://www.instagram.com/udayantu',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    telephone: '+91-8800-8800-88',
    email: 'support@udayantu.com',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressLocality: 'India',
  },
};

/**
 * FAQ Page Schema
 */
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb Navigation Schema
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Educational Program Schema
 */
export function createEducationalProgramSchema(program: {
  name: string;
  description: string;
  duration: string;
  price: number;
  jobPlacementRate: number;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: program.name,
    description: program.description,
    educationalLevel: 'Bachelor, Master',
    duration: program.duration,
    offers: {
      '@type': 'Offer',
      price: program.price,
      priceCurrency: 'INR',
    },
    educationalCredentialAwarded: 'Job Placement Guarantee',
    jobPlacementRate: {
      '@type': 'QuantitativeValue',
      value: program.jobPlacementRate,
    },
    provider: organizationSchema,
  };
}

/**
 * Blog Post Schema
 */
export function createBlogPostSchema(post: {
  title: string;
  description: string;
  image: string;
  publishDate: string;
  author?: string;
  content?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      '@type': 'Organization',
      name: post.author || 'UdaYantu',
    },
    publisher: {
      '@type': 'Organization',
      name: 'UdaYantu',
      logo: {
        '@type': 'ImageObject',
        url: 'https://udayantu.com/favicon.png',
      },
    },
    ...(post.content && { articleBody: post.content }),
  };
}

/**
 * Service Schema
 */
export function createServiceSchema(service: {
  name: string;
  description: string;
  image?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: organizationSchema,
    ...(service.image && { image: service.image }),
  };
}

/**
 * Insert structured data into document head
 */
export function injectStructuredData(schema: StructuredData) {
  // Remove existing schema if present
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Create and inject new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Update page title and meta description
 */
export function updatePageMeta(title: string, description: string, ogImage?: string) {
  // Update title
  document.title = title;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description;

  // Update OG tags
  if (ogImage) {
    let ogImage_tag = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    if (!ogImage_tag) {
      ogImage_tag = document.createElement('meta');
      ogImage_tag.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage_tag);
    }
    ogImage_tag.content = ogImage;
  }
}
