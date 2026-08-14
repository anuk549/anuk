export interface Profile {
  _id: string;
  full_name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  avatar_url: string;
  location?: string;
  logo_url?: string;
}

export interface Experience {
  _id: string;
  company: string;
  role: string;
  period: string;
  points: string[];
  icon: string;
  link?: string;
  logo_url?: string;
  order_index?: number;
}

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  period: string;
  description: string;
  icon: string;
  link?: string;
  logo_url?: string;
  order_index?: number;
}

export interface Skill {
  _id: string;
  category: string;
  name: string;
}

export interface Tech {
  _id: string;
  name: string;
  slug: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Project {
  _id: string;
  key?: string;
  title: string;
  description: string;
  image_url: string;
  images?: string[];
  live_url: string;
  github_url: string;
  tags: string[];
  featured?: boolean;
  order_index?: number;
}
