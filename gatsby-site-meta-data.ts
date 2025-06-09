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
      repo: `ssseok/hyun-seok-blog`,
    },
  },

  /**
   * introduce yourself
   */
  author: {
    name: `박현석`,
    nickname: `석이`,
    stack: ['Frontend', 'React', 'Typescript', 'TailwindCSS', 'Next.js'],
    bio: {
      email: `luckseok1@gmail.com`,
      residence: 'Seoul, South Korea',
      bachelorDegree: '',
    },
    social: {
      github: `https://github.com/ssseok`,
      linkedIn: `https://www.linkedin.com/in/%ED%98%84%EC%84%9D-%EB%B0%95-a9179a243/`,
      resume: `https://www.figma.com/design/UoAKtEMCYGAjAKV88Bdkxr/%EB%B0%95%ED%98%84%EC%84%9D-%EC%9D%B4%EB%A0%A5%EC%84%9C?node-id=0-1&t=sLWLGyD4sZeeb0lg-1`,
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
      title: 'TROUBLE-SHOOTING',
      category: 'Trouble-Shooting',
    },
  ],

  /**
   * metadata for About Page
   */
  timestamps: [
    {
      category: 'Activity',
      date: '2025.04 - 2025.06',
      en: 'SWYP',
      kr: '스위프',
      info: 'SWYP WEB 9기',
      link: 'https://swyp.framer.website',
    },
    {
      category: 'Activity',
      date: '2023.06',
      en: 'Nextjs.kr',
      kr: '넥스트제이에스.코리아',
      info: 'Next.js Korea User Group',
      link: 'https://github.com/Nextjs-kr',
    },
    {
      category: 'Activity',
      date: '2022.08 - 2023.02',
      en: 'Code States',
      kr: '코드스테이츠',
      info: 'Software Engineering Bootcamp Frontend',
      link: 'https://www.codestates.com/',
    },
  ],

  /**
   * metadata for Playground Page
   */
  projects: [
    {
      title: 'HOBBi',
      description: '취미를 더 즐겁고 행복하게 하는 커뮤니티 공간, 호비',
      techStack: ['TypeScript', 'Next.js', 'TailwindCSS', 'Zustand', 'React-Query', 'Framer-Motion'],
      thumbnailUrl: 'hobbi.png', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: 'https://github.com/SWYP-HOBBI',
        demo: 'https://swyp-hobbi-front.vercel.app/',
        googlePlay: '',
        appStore: '',
      },
    },
    {
      title: 'wedding.invitation',
      description: 'React 기반으로 만든 모바일 결혼 청첩장입니다. 누구나 손쉽게 커스텀 할 수 있게끔 제작하였습니다.',
      techStack: ['TypeScript', 'React', 'TailwindCSS', 'Shadcn/UI'],
      thumbnailUrl: 'wedding.png', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: 'https://github.com/ssseok/wedding.invitation',
        demo: 'https://weddinginvitation-mu.vercel.app/',
        googlePlay: '',
        appStore: '',
      },
    },
    {
      title: 'Why Stay?',
      description: '숙박 목적에 따른 분류로 안성맞춤 숙박 업체를 편하게 예약할 수 있는 웹 서비스입니다.',
      techStack: ['JavaScript', 'React', 'Redux-Toolkit', 'Styled-Components', 'React-Query', 'Axios'],
      thumbnailUrl: 'why_stay.png', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: 'https://github.com/ssseok/Why-Stay?tab=readme-ov-file',
        demo: 'http://whystay.p-e.kr/',
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
