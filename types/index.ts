// types/index.ts

export interface TermProps {
  id: string;
  createdAt: string; // These should match the types after .toISOString() transformation
  updatedAt: string;
  title: string;
  content?: string;
  example_conent?: string;
  example_conent_published: boolean;
  tldr?: string;
  tldr_published: boolean;
  studies?: StudiesProps[];
  studies_published: boolean;
  image?: string;
  published: boolean;
  sponsor: boolean;
  source?: SourceProps;
  sourceId?: string;
  language?: Language;
  languageId?: string;
  Tag?: TagProps;
  tagId?: string;
  audioUrlTerm?: string;
  audioUrlContent?: string;
  audioUrlTldr?: string;
  views: number;
}

export interface TagProps {
  id: string;
  title: string;
  content?: string;
  image?: string;
  published: boolean;
  terms: TermProps[];
  languages: Language[];
}

export interface SourceProps {
  id: string;
  title: string;
  content?: string;
  href?: string;
  image?: string;
  published: boolean;
  views: number;
  terms: TermProps[];
}

export interface Language {
  id: string;
  title: string;
  i18n?: string;
  image?: string;
  published: boolean;
  terms: TermProps[];
  Tag?: TagProps;
  tagId?: string;
}

export interface StudiesProps {
  id: number;
  title: string;
  content: string;
  Term?: TermProps;
  termId?: string;
}

export type SerializedTermProps = Omit<TermProps, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};
