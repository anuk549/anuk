export interface BioLink {
  title: string;
  url: string;
}

export interface BioData {
  _id: string;
  hero_title: string;
  story_paragraphs: string[];
  university_title: string;
  university_intro: string;
  university_image_url: string;
  university_text_before_links: string;
  university_links: BioLink[];
  university_text_after_links: string;
  career_period: string;
  career_role: string;
  career_company: string;
  career_intro: string;
  career_image_url: string;
  career_body: string;
  career_stack: string[];
  ending: string;
}

export const defaultBio: BioData = {
  _id: 'bio',
  hero_title: 'Building software started with curiosity.',
  story_paragraphs: [
    'Since childhood, I was fascinated by computers and always wanted to understand how technology works. What started as curiosity became a passion for creating software.',
    'During my journey at Sri Lanka Institute of Information Technology (SLIIT), I started learning software engineering and turning my ideas into applications. Creating my first application was a moment that showed me I wanted to keep building software.',
  ],
  university_title: 'Learning through collaboration',
  university_intro:
    'University was where theory met practice — and where I learned that great software comes from great teams. Working with friends and classmates at SLIIT showed me how collaboration turns ideas into working applications.',
  university_image_url: '',
  university_text_before_links: 'Together we designed and built team projects like',
  university_links: [
    { title: 'ISLIIT', url: 'https://github.com/ITMP-Project/ISLIIT' },
    { title: 'PAF Project', url: 'https://github.com/PAF-Project-demo/PAF' },
  ],
  university_text_after_links:
    '— learning teamwork, full-stack development, REST APIs, and how to solve real problems as a group.',
  career_period: 'July 2024 — July 2026',
  career_role: 'Web Developer',
  career_company: 'Inntri Labs',
  career_intro:
    'My professional journey started at Inntri Labs, where I worked on real-world enterprise applications and learned how software is designed, developed, and maintained in a production environment.',
  career_image_url: '',
  career_body:
    'As a Web Developer, I got hands-on with enterprise ERP systems — transport, HR, and factory management platforms. I learned how professional company software actually works behind the scenes, building with React, TypeScript, Vue.js, JavaScript, Java, and Spring Boot. My team helped me grow every step of the way, and I picked up a lot about Agile workflows, API design, and shipping reliable features in a real business environment.',
  career_stack: ['React', 'TypeScript', 'Java', 'Spring Boot', 'Vue.js', 'JavaScript'],
  ending:
    'Today, I continue learning, experimenting with new technologies, and building software that creates meaningful solutions.',
};

export function mergeBio(data: Partial<BioData> | null): BioData {
  if (!data) return defaultBio;
  return {
    ...defaultBio,
    ...data,
    story_paragraphs: data.story_paragraphs?.length ? data.story_paragraphs : defaultBio.story_paragraphs,
    university_links: data.university_links?.length ? data.university_links : defaultBio.university_links,
    career_stack: data.career_stack?.length ? data.career_stack : defaultBio.career_stack,
  };
}
