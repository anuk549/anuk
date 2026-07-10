import { Briefcase, GraduationCap, Building2, Code2, Server, Wrench, Layers, Truck, Users, Factory } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Briefcase, GraduationCap, Building2, Code2, Server, Wrench, Layers, Truck, Users, Factory,
};

export function getIcon(name?: string): LucideIcon {
  return (name && iconMap[name]) || Briefcase;
}

export const techMeta: Record<string, { slug: string; color: string }> = {
  // Frontend
  'React': { slug: 'react', color: '61DAFB' },
  'Next.js': { slug: 'nextdotjs', color: 'FFFFFF' },
  'TypeScript': { slug: 'typescript', color: '3178C6' },
  'JavaScript': { slug: 'javascript', color: 'F7DF1E' },
  'Vue.js': { slug: 'vuedotjs', color: '4FC08D' },
  'HTML5': { slug: 'html5', color: 'E34F26' },
  'CSS3': { slug: 'css', color: '1572B6' },
  'Tailwind CSS': { slug: 'tailwindcss', color: '38BDF8' },

  // Backend
  'Java': { slug: 'openjdk', color: 'FFFFFF' },
  'Spring Boot': { slug: 'springboot', color: '6DB33F' },
  'Node.js': { slug: 'nodedotjs', color: '5FA04E' },
  'Express': { slug: 'express', color: 'FFFFFF' },
  'FastAPI': { slug: 'fastapi', color: '009688' },
  'REST APIs': { slug: 'openapiinitiative', color: '6BA539' },
  'MongoDB': { slug: 'mongodb', color: '47A248' },
  'PostgreSQL': { slug: 'postgresql', color: '4169E1' },
  'Supabase': { slug: 'supabase', color: '3ECF8E' },

  // Tools & Platforms
  'Git': { slug: 'git', color: 'F05032' },
  'GitHub': { slug: 'github', color: 'FFFFFF' },
  'Bitbucket': { slug: 'bitbucket', color: '0052CC' },
  'Jira': { slug: 'jira', color: '0052CC' },
  'Trello': { slug: 'trello', color: '0079BF' },
  'Docker': { slug: 'docker', color: '2496ED' },

  // Testing & QA
  'Postman': { slug: 'postman', color: 'FF6C37' },
};
