export type CategorySlug =
  | "politics"
  | "world"
  | "economy"
  | "technology"
  | "culture"
  | "science";

export interface Category {
  slug: CategorySlug;

}

export interface ArticleImage {
  src: string;
  alt: string;
}
  export interface ArticleDetail extends Article {
    body: string;
    updatedAt: string;
  }
export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: CategorySlug;
  /** ISO 8601 */
  publishedAt: string;
  readMinutes: number;
  image?: ArticleImage;
  isBreaking?: boolean;
  /** 1 = خبر اصلی، 2 تا 4 = خبرهای فرعی صفحهٔ اول */
  featuredRank?: number;
}
