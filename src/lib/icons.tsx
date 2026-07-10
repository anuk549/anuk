import { Briefcase, GraduationCap, Building2, Code2, Server, Wrench, Layers, Truck, Users, Factory } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Briefcase, GraduationCap, Building2, Code2, Server, Wrench, Layers, Truck, Users, Factory,
};

export function getIcon(name?: string): LucideIcon {
  return (name && iconMap[name]) || Briefcase;
}

export const techMeta: Record<string, { slug: string; color: string }> = {
  'React': { slug: 'react', color: '61DAFB' },
  'Next.js': { slug: 'nextdotjs', color: 'FFFFFF' },
  'TypeScript': { slug: 'typescript', color: '3178C6' },
  'JavaScript': { slug: 'javascript', color: 'F7DF1E' },
  'Vue.js': { slug: 'vuedotjs', color: '4FC08D' },
  'Node.js': { slug: 'nodedotjs', color: '5FA04E' },
  'Express': { slug: 'express', color: 'FFFFFF' },
  'Java': { slug: 'openjdk', color: 'FFFFFF' },
  'Spring Boot': { slug: 'springboot', color: '6DB33F' },
  'MongoDB': { slug: 'mongodb', color: '47A248' },
  'PostgreSQL': { slug: 'postgresql', color: '4169E1' },
  'FastAPI': { slug: 'fastapi', color: '009688' },
  'Docker': { slug: 'docker', color: '2496ED' },
  'Git': { slug: 'git', color: 'F05032' },
  'Tailwind CSS': { slug: 'tailwindcss', color: '38BDF8' },
  'Supabase': { slug: 'supabase', color: '3ECF8E' },
};
