export type ToolCategory =
  | "developer"
  | "student"
  | "productivity"
  | "image"
  | "document"
  | "finance"
  | "converters"
  | "seo";

export type ToolItem = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSection = {
  id: string;
  heading: string;
  content: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  updatedAt: string;
  readingMinutes: number;
  relatedToolSlugs: string[];
  faqs: BlogFaq[];
  sections: BlogSection[];
};
