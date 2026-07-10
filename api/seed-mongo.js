import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'portfolio';

if (!MONGO_URI) {
  console.error('[seed-mongo] Missing environment variable: MONGODB_URI');
  process.exit(1);
}

function upsertByKey(collection, key, doc) {
  return collection.updateOne(
    { key },
    { $set: { ...doc, key } },
    { upsert: true }
  );
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // Clear collections to remove outdated placeholders
  const collectionsToClear = ['profile', 'experience', 'education', 'skills', 'projects', 'technologies'];
  for (const name of collectionsToClear) {
    await db.collection(name).deleteMany({});
  }

  // profile (single document)
  const profile = {
    _id: 'profile',
    full_name: 'Anuk Hettiarachchi',
    title: 'Full Stack Developer | React | Java | Spring Boot',
    phone: '+94 70 379 9364',
    email: 'anuk200101@gmail.com',
    linkedin: 'linkedin.com/in/anuk-hettiarachchi-3380b2219',
    github: 'github.com/anuk549',
    summary:
      'Full Stack Developer with 1+ years of professional experience building and maintaining enterprise web applications across transport, HR, and manufacturing domains. Experienced in developing responsive front-end interfaces using React, Vue.js, JavaScript, and TypeScript, while designing and maintaining RESTful APIs using Java and Spring Boot. Skilled in API testing, debugging, Agile development, and cross-functional collaboration. Strong foundation in software engineering principles, clean code practices, and end-to-end application development.',
    avatar_url: '',
    location: 'Sri Lanka',
    updated_at: new Date().toISOString(),
  };

  await db.collection('profile').updateOne(
    { _id: profile._id },
    { $set: profile },
    { upsert: true }
  );

  // experience
  const experiences = [
    {
      key: 'exp-inntri-labs',
      company: 'Inntri Labs',
      role: 'Web Developer',
      period: 'Jul 2024 – Mar 2026',
      points: [
        'Developed and maintained enterprise web applications serving business operations across transport, HR, and factory management domains.',
        'Built responsive user interfaces using React, Vue.js, TypeScript, and JavaScript to improve usability and user experience.',
        'Designed and implemented RESTful CRUD APIs using Java and Spring Boot to support business-critical workflows.',
        'Collaborated with designers, QA engineers, and stakeholders to translate requirements into production-ready features.',
        'Conducted API validation and testing using Postman, improving software quality and deployment readiness.',
        'Identified, documented, and tracked software defects through QA processes, contributing to application stability.',
        'Participated in Agile development cycles including sprint planning, implementation, testing, and deployment activities.',
        'Maintained source control and collaborative development workflows using Git, GitHub, and Bitbucket.'
      ],
      icon: 'Briefcase',
      link: '',
      order_index: 0,
    }
  ];

  const expCol = db.collection('experience');
  for (const e of experiences) {
    await upsertByKey(expCol, e.key, e);
  }

  // education
  const education = [
    {
      key: 'edu-sliit',
      institution: 'Sri Lanka Institute of Information Technology (SLIIT)',
      degree: 'Bachelor of Science (Hons) in Information Technology',
      period: 'Final Year Undergraduate',
      description: 'Focused on software engineering, web application development, and software lifecycle.',
      icon: 'GraduationCap',
      link: '',
      order_index: 0,
    },
  ];

  const eduCol = db.collection('education');
  for (const e of education) {
    await upsertByKey(eduCol, e.key, e);
  }

  // skills (category + name)
  const skills = [
    // Frontend
    { key: 'skill-fe-react', category: 'Frontend', name: 'React', order_index: 0 },
    { key: 'skill-fe-vue', category: 'Frontend', name: 'Vue.js', order_index: 1 },
    { key: 'skill-fe-js', category: 'Frontend', name: 'JavaScript', order_index: 2 },
    { key: 'skill-fe-ts', category: 'Frontend', name: 'TypeScript', order_index: 3 },
    { key: 'skill-fe-html', category: 'Frontend', name: 'HTML5', order_index: 4 },
    { key: 'skill-fe-css', category: 'Frontend', name: 'CSS3', order_index: 5 },

    // Backend
    { key: 'skill-be-java', category: 'Backend', name: 'Java', order_index: 0 },
    { key: 'skill-be-springboot', category: 'Backend', name: 'Spring Boot', order_index: 1 },
    { key: 'skill-be-rest', category: 'Backend', name: 'REST APIs', order_index: 2 },
    { key: 'skill-be-crud', category: 'Backend', name: 'CRUD Operations', order_index: 3 },

    // Testing & QA
    { key: 'skill-qa-postman', category: 'Testing & Quality Assurance', name: 'Postman', order_index: 0 },
    { key: 'skill-qa-apitesting', category: 'Testing & Quality Assurance', name: 'API Testing', order_index: 1 },
    { key: 'skill-qa-manual', category: 'Testing & Quality Assurance', name: 'Manual Testing', order_index: 2 },
    { key: 'skill-qa-bug', category: 'Testing & Quality Assurance', name: 'Bug Reporting', order_index: 3 },

    // Tools & Platforms
    { key: 'skill-tools-git', category: 'Tools & Platforms', name: 'Git', order_index: 0 },
    { key: 'skill-tools-github', category: 'Tools & Platforms', name: 'GitHub', order_index: 1 },
    { key: 'skill-tools-bitbucket', category: 'Tools & Platforms', name: 'Bitbucket', order_index: 2 },
    { key: 'skill-tools-jira', category: 'Tools & Platforms', name: 'Jira', order_index: 3 },
    { key: 'skill-tools-trello', category: 'Tools & Platforms', name: 'Trello', order_index: 4 },

    // Methodologies
    { key: 'skill-meth-agile', category: 'Methodologies', name: 'Agile', order_index: 0 },
    { key: 'skill-meth-scrum', category: 'Methodologies', name: 'Scrum', order_index: 1 },
    { key: 'skill-meth-sdlc', category: 'Methodologies', name: 'SDLC', order_index: 2 },
    { key: 'skill-meth-uiux', category: 'Methodologies', name: 'UI/UX Implementation', order_index: 3 },
    { key: 'skill-meth-req', category: 'Methodologies', name: 'Requirements Analysis', order_index: 4 }
  ];

  const skillsCol = db.collection('skills');
  for (const s of skills) {
    await upsertByKey(skillsCol, s.key, s);
  }

  // projects
  const projects = [
    {
      key: 'proj-transport',
      title: 'Transport Management System',
      description: 'Developed frontend modules and backend APIs supporting transportation operations and workflow automation. Implemented responsive UI components and integrated REST APIs to improve operational efficiency.',
      image_url: '',
      live_url: '',
      github_url: '',
      tags: ['React', 'Java', 'Spring Boot', 'REST APIs'],
      featured: true,
      order_index: 0,
    },
    {
      key: 'proj-hr',
      title: 'HR Management System',
      description: 'Built and enhanced employee management features including CRUD functionality and API integrations. Collaborated with stakeholders to deliver business requirements within Agile sprint cycles.',
      image_url: '',
      live_url: '',
      github_url: '',
      tags: ['React', 'TypeScript', 'Java', 'Spring Boot'],
      featured: true,
      order_index: 1,
    },
    {
      key: 'proj-factory',
      title: 'Factory Management System',
      description: 'Contributed to development of production and operational management modules. Supported testing, bug fixing, and feature enhancements to improve system reliability.',
      image_url: '',
      live_url: '',
      github_url: '',
      tags: ['Vue.js', 'JavaScript', 'Java', 'Spring Boot'],
      featured: false,
      order_index: 2,
    }
  ];

  const projectsCol = db.collection('projects');
  for (const p of projects) {
    await upsertByKey(projectsCol, p.key, p);
  }

  // technologies (carousel)
  const technologies = [
    { key: 'tech-react', name: 'React', icon: 'react', category: 'Frontend', order_index: 0 },
    { key: 'tech-vue', name: 'Vue.js', icon: 'vuedotjs', category: 'Frontend', order_index: 1 },
    { key: 'tech-typescript', name: 'TypeScript', icon: 'typescript', category: 'Frontend', order_index: 2 },
    { key: 'tech-javascript', name: 'JavaScript', icon: 'javascript', category: 'Frontend', order_index: 3 },
    { key: 'tech-java', name: 'Java', icon: 'java', category: 'Backend', order_index: 4 },
    { key: 'tech-springboot', name: 'Spring Boot', icon: 'springboot', category: 'Backend', order_index: 5 },
    { key: 'tech-git', name: 'Git', icon: 'git', category: 'Tools', order_index: 6 },
    { key: 'tech-github', name: 'GitHub', icon: 'github', category: 'Tools', order_index: 7 }
  ];

  const techCol = db.collection('technologies');
  for (const t of technologies) {
    await upsertByKey(techCol, t.key, t);
  }

  // Summary counts
  const collections = ['profile', 'experience', 'education', 'skills', 'projects', 'technologies'];
  const summary = {};
  for (const name of collections) {
    summary[name] = await db.collection(name).countDocuments();
  }

  console.log('[seed-mongo] Done. Counts:', summary);
  await client.close();
}

main().catch((e) => {
  console.error('[seed-mongo] Failed:', e);
  process.exit(1);
});
