export const supportLinks = [
  { label: 'Report Bug', icon: '🐞', path: '/support/report-bug' },
  { label: 'Contact Us', icon: '📞', path: '/support/contact' },
  { label: 'FAQs', icon: '❓', path: '/support/faqs' },
];

export const issueCategories = [
  'Website Bug',
  'Matchmaking',
  'Code Execution',
  'Leaderboard',
  'Account/Login',
  'Performance Issue',
  'UI Issue',
  'Other',
];

export const browsers = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Brave', 'Other'];

export const contactSubjects = [
  'General Question',
  'Account Help',
  'Feature Request',
  'Partnership',
  'Feedback',
  'Technical Support',
];

export const contactCards = [
  ['📧', 'Email Support', 'support@letsduel.com'],
  ['💼', 'Business Inquiries', 'business@letsduel.com'],
  ['💬', 'Discord Community', 'Join our Discord server to connect with other competitive programmers.'],
  ['🐦', 'Twitter / X', 'Follow LetsDuel for updates and announcements.'],
  ['💡', 'Feature Requests', 'Suggest new ideas to improve LetsDuel.'],
  ['📍', 'Location', 'India'],
];

export const faqGroups = [
  {
    title: 'Account',
    items: [
      ['How do I create an account?', 'Click Get Started and register using your email or Google account.'],
      ['I forgot my password.', 'Use the Forgot Password option on the login page.'],
      ['Can I change my username?', 'Yes, from your profile settings.'],
      ['Is my account free?', 'Yes. Creating an account is completely free.'],
    ],
  },
  {
    title: 'Duels',
    items: [
      ['How does a duel work?', 'You and your opponent receive the same coding problems and compete to solve them within the time limit.'],
      ['How is the winner decided?', 'Based on problems solved, penalty time, and submission time in case of ties.'],
      ['Can I challenge my friends?', 'Yes. Send them a duel invitation link.'],
      ['Can I play random opponents?', 'Yes. LetsDuel supports public matchmaking.'],
    ],
  },
  {
    title: 'Coding',
    items: [
      ['Which coding platforms are supported?', 'Currently LeetCode is supported, with more integrations planned.'],
      ['Which programming languages can I use?', 'Any language supported by the coding platform.'],
      ['Does LetsDuel judge my code?', "LetsDuel uses the integrated coding platform's online judge."],
    ],
  },
  {
    title: 'Technical Issues',
    items: [
      ["The website isn't loading properly.", 'Refresh the page, clear your browser cache, or try another browser.'],
      ["Code submission isn't working.", 'Refresh the page. If the problem continues, report it through the Report Bug page.'],
      ['I found a bug.', 'Use the Report Bug page and attach a screenshot if possible.'],
      ['My duel disconnected.', 'Refresh the page. Your progress is automatically saved whenever possible.'],
    ],
  },
  {
    title: 'General',
    items: [
      ['Is LetsDuel free?', 'Yes, the core platform is completely free.'],
      ['Can I suggest new features?', 'Yes! Use the Contact Us page and select "Feature Request."'],
      ['Is my coding data secure?', 'Yes. User data is securely stored and never shared without permission.'],
      ['Will more coding platforms be added?', 'Yes. More competitive programming platforms are planned.'],
    ],
  },
];

export const stats = [
  ['DUELS PLAYED', '10K+'],
  ['ACTIVE CODERS', '5K+'],
  ['PROBLEMS SOLVED', '50K+'],
];

export const features = [
  ['Real-time Duels', 'Compete head-to-head in real-time.', 'bolt'],
  ['Your IDE', 'Code in the IDE you love and submit.', 'code'],
  ['First to AC Wins', 'Whoever solves and gets accepted first, wins.', 'cup'],
  ['No Distractions', 'Clean. Focused. Built for coders.', 'shield'],
];

export const modes = [
  {
    title: 'Battle Royale',
    tag: 'Contest Mode',
    meta: 'N Players',
    text: 'Any number of coders enter one contest. Problems are scored like Codeforces, with points, penalties, and a live leaderboard.',
    points: ['Codeforces-style scoring', 'Live ranking', 'Best for large contests'],
  },
  {
    title: 'N vs N Team Duel',
    tag: 'Team Mode',
    meta: '1v1 to 8v8',
    text: 'Team A battles Team B. Players choose a side, and team sizes can be uneven for handicap duels like 1v6, 3v2, or 8v8.',
    points: ['Choose Team A or B', 'Handicap supported', 'Max 8 vs 8'],
  },
  {
    title: 'Single Elimination',
    tag: 'Bracket Mode',
    meta: '4 / 8 / 16 / 32',
    text: 'Players compete through a knockout bracket. Winners advance round by round until only one champion remains.',
    points: ['Fixed bracket sizes', 'Round-by-round progress', 'One final champion'],
  },
  {
    title: 'Random Matchmaking',
    tag: 'Queue Mode',
    meta: 'Auto Pairing',
    text: 'Coders join a lobby and LetsDuel automatically pairs them. Random matchmaking can also be used to seed bracket tournaments.',
    points: ['Lobby based', 'Automatic pairing', 'Works with brackets'],
  },
];

export const duelRoomModes = [
  {
    id: 'battle-royale',
    title: 'Battle Royale',
    tag: 'Unlimited Players',
    description:
      'Any number of coders compete in one contest with the same problem set, increasing difficulty, and Codeforces-style scoring.',
    highlights: ['Live leaderboard', 'Shareable room code', 'Creator starts contest', '-10 per wrong submission'],
  },
  {
    id: 'team-duel',
    title: 'N vs N Team Duel',
    tag: '1v1 to 8v8',
    description:
      'Team A battles Team B. Uneven teams and handicap matches are allowed, and players can switch teams before start.',
    highlights: ['8 slots per team', 'Uneven teams allowed', 'Ready status', 'Click empty slot to move'],
  },
  {
    id: 'single-elimination',
    title: 'Single Elimination',
    tag: '4 / 8 / 16 / 32',
    description:
      'Players join a waiting lobby, then a randomized knockout bracket is created when the participant count is valid.',
    highlights: ['Random bracket', 'Winner advances', 'Champion final', 'Exact player count required'],
  },
  {
    id: 'code-gauntlet',
    title: 'Code Gauntlet',
    tag: 'Strictly 1v1',
    description:
      'Both players unlock the same progressive sequence. Solve one problem to unlock the next before time expires.',
    highlights: ['Progression path', 'Harder each round', 'Penalty tie-breaker', 'Two-player duel'],
  },
];

export const demoPlayers = [
  'tourist_shadow', 'dp_knight', 'bit_coder', 'greedy_master', 'stack_wizard', 'array_runner',
  'binary_sage', 'graph_ninja', 'heap_hunter', 'mod_math', 'prefix_pro', 'segment_tree',
  'lazy_prop', 'fft_runner', 'dfs_nomad', 'bfs_blitz', 'rating_1600', 'rating_1800',
  'zero_one_bfs', 'bitmasker', 'flow_master', 'suffix_sorter', 'fenwick_fury', 'two_pointer',
  'constructive_x', 'hash_guard', 'number_theory', 'matrix_mage', 'shortest_path',
  'recursionist', 'final_boss',
];
