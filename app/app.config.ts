export default defineAppConfig({
  blog: {
    title: 'Antonio\'s blog',
    subtitle: '前端小蝦米',
    description: '我是一隻前端小蝦米，努力夢想有一天變成大鯨魚',
    author: 'Antonio',
    avatar: '/images/antonio.webp',
    perPage: 10,
    menu: [
      { label: '文章', to: '/archives/', icon: 'posts' },
      { label: '鐵人賽', to: '/categories/iThome-鐵人賽/', icon: 'ironman' },
      { label: '分類', to: '/categories/', icon: 'category' },
      { label: '標籤', to: '/tags/', icon: 'tag' },
      { label: '關於我', to: '/about/', icon: 'about' },
    ],
    social: [
      { label: 'GitHub', href: 'https://github.com/LING-JUN-HAO', icon: 'github' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/antonio-222984258/', icon: 'linkedin' },
      { label: 'iThome 鐵人賽', href: 'https://ithelp.ithome.com.tw/users/20116554/ironman', icon: 'ironman' },
      { label: 'Email', href: 'mailto:qd513020@gmail.com', icon: 'mail' },
    ],
  },
})
