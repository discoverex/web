export const menus = [
  { name: 'Home', path: '/home', description: '첫 진입 페이지' },
  { 
    name: '렉스를 찾아라!', 
    path: process.env.NODE_ENV === 'production' 
      ? 'https://discoverex-discoverex-329947062450.asia-northeast3.run.app' 
      : 'http://localhost:3001', 
    description: '숨은그림찾기',
    isExternal: true
  },
  { 
    name: '퀴즈 매직아이', 
    path: process.env.NODE_ENV === 'production' 
      ? 'https://discoverex-magic-eye-329947062450.asia-northeast3.run.app' 
      : 'http://localhost:3002', 
    description: '매직아이 게임',
    isExternal: true
  },
];
