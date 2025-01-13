export default {
  /**
   * basic Information
   */
  title: `hyun-seok.com`,
  description: `개발자 석이`,
  language: `ko`,
  siteUrl: `https://hyun-seok.com/`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder

  /**
   * comments setting
   */
  comments: {
    utterances: {
      repo: `ssseok/hyun-seok-blog`, //`danmin20/danmin-gatsby-blog`,
    },
  },

  /**
   * introduce yourself
   */
  author: {
    name: `박현석`,
    nickname: `석이`,
    stack: ['Frontend', 'React', 'Typescript'],
    bio: {
      email: `luckseok1@gmail.com`,
      residence: 'Seoul, South Korea',
      bachelorDegree: '',
    },
    social: {
      github: `https://github.com/ssseok`,
      linkedIn: `https://www.linkedin.com/in/%ED%98%84%EC%84%9D-%EB%B0%95-a9179a243/`,
      resume: `https://docs.google.com/document/d/1RaFKfZ_nh5dd_-19pQ4yolYMSTvn8qMnZ9MML5vNhYw/edit`,
    },
    dropdown: {
      naver: 'https://blog.naver.com/luckseok1',
    },
  },

  /**
   * definition of featured posts
   */
  featured: [
    {
      title: 'DEV',
      category: 'Dev',
    },
    {
      title: 'EXPERIENCE',
      category: 'Experience',
    },
    {
      title: 'PROJECT',
      category: 'Project',
    },
    {
      title: 'LOVE',
      category: 'Love',
    },
  ],

  /**
   * metadata for About Page
   */
  timestamps: [
    {
      category: 'Activity',
      date: '2023.06 - NOW',
      en: 'Nextjs.kr',
      kr: '넥스트제이에스.코리아',
      info: 'Next.js Korea User Group',
      link: 'https://github.com/Nextjs-kr',
    },
  ],

  /**
   * metadata for Playground Page
   */
  projects: [
    {
      title: 'IntroMe',
      description: '자기소개서를 작성할 때 필요한 여러 기능들이 합쳐진 웹서비스',
      techStack: ['TypeScript', 'React', 'Redux', 'TailwindCSS', 'React-Query'],
      thumbnailUrl: '', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: '',
        demo: '',
        googlePlay: '',
        appStore: '',
      },
    },
  ],

  /**
   * metadata for Buy Me A Coffee
   */
  remittances: {
    kakaopay: {
      qrCode: 'kakao_qr.svg', // Path to your in the 'assets' folder
    },
  },
};
