export const countries = [
  {
    id: 'india',
    flag: '🇮🇳',
    name: 'India',
    meta: 'Parliamentary democracy · 543 constituencies',
    nextElection: 'Next: State elections Oct 2025',
    accentColor: '#E24B4A',
    globeCoords: { lat: 20, lon: 78 },
    steps: [
      { n: 1, title: 'Notification', desc: 'Election Commission announces schedule', date: 'Mar 2024' },
      { n: 2, title: 'Nomination', desc: 'Candidates file papers', date: 'Apr 2024' },
      { n: 3, title: 'Campaign', desc: 'Rallies and public outreach', date: 'Apr-May 2024' },
      { n: 4, title: 'Voting', desc: 'Multiple phases of polling', date: 'Apr-Jun 2024' },
      { n: 5, title: 'Counting', desc: 'Votes counted and declared', date: 'Jun 4 2024' },
      { n: 6, title: 'Government', desc: 'Formation of new government', date: 'Jun 2024' }
    ],
    aiSummary: 'India\'s 2024 general election was the largest democratic exercise in history. Over 600 million people voted across 7 phases. The ruling NDA alliance secured a third term, albeit with a reduced majority, leading to a coalition government.',
    quiz: [
      { q: 'How many constituencies are there in the Lok Sabha?', opts: ['543', '545', '552', '530'], ans: 0 },
      { q: 'Who conducts the elections in India?', opts: ['Supreme Court', 'Election Commission', 'Parliament', 'President'], ans: 1 },
      { q: 'What is the voting age in India?', opts: ['16', '18', '21', '25'], ans: 1 }
    ]
  },
  {
    id: 'usa',
    flag: '🇺🇸',
    name: 'United States',
    meta: 'Federal presidential republic · 538 electoral votes',
    nextElection: 'Next: Midterms Nov 2026',
    accentColor: '#378ADD',
    globeCoords: { lat: 38, lon: -97 },
    steps: [
      { n: 1, title: 'Primaries', desc: 'Parties select nominees', date: 'Jan-Jun 2024' },
      { n: 2, title: 'Conventions', desc: 'Official nomination', date: 'Jul-Aug 2024' },
      { n: 3, title: 'Campaign', desc: 'General election campaign', date: 'Sep-Nov 2024' },
      { n: 4, title: 'Election Day', desc: 'Popular vote', date: 'Nov 5 2024' },
      { n: 5, title: 'Electoral College', desc: 'Electors cast votes', date: 'Dec 2024' },
      { n: 6, title: 'Inauguration', desc: 'President takes office', date: 'Jan 20 2025' }
    ],
    aiSummary: 'The 2024 US Presidential election saw a highly polarized campaign. The electoral college system plays a crucial role, with swing states determining the outcome. Early voting and mail-in ballots were significant factors.',
    quiz: [
      { q: 'How many electoral votes are needed to win?', opts: ['269', '270', '538', '300'], ans: 1 },
      { q: 'When is Election Day typically held?', opts: ['First Tuesday in Nov', 'Nov 1st', 'First Mon in Nov', 'Tuesday after first Mon in Nov'], ans: 3 },
      { q: 'Which body officially elects the President?', opts: ['Popular Vote', 'Congress', 'Electoral College', 'Supreme Court'], ans: 2 }
    ]
  },
  {
    id: 'uk',
    flag: '🇬🇧',
    name: 'United Kingdom',
    meta: 'Parliamentary democracy · 650 constituencies',
    nextElection: 'Next: General Election 2029',
    accentColor: '#5DCAA5',
    globeCoords: { lat: 54, lon: -2 },
    steps: [
      { n: 1, title: 'Dissolution', desc: 'Parliament dissolved', date: 'May 30 2024' },
      { n: 2, title: 'Campaign', desc: 'Short intensive campaign', date: 'Jun 2024' },
      { n: 3, title: 'Registration', desc: 'Voter registration deadline', date: 'Jun 18 2024' },
      { n: 4, title: 'Polling Day', desc: 'Voting across UK', date: 'Jul 4 2024' },
      { n: 5, title: 'Counting', desc: 'Overnight counting', date: 'Jul 4-5 2024' },
      { n: 6, title: 'New Parliament', desc: 'State Opening', date: 'Jul 17 2024' }
    ],
    aiSummary: 'The 2024 UK general election resulted in a significant shift in power. Conducted under the First-Past-The-Post system, the election saw the Labour party win a large majority, ending 14 years of Conservative rule.',
    quiz: [
      { q: 'What electoral system does the UK use?', opts: ['Proportional Representation', 'First-Past-The-Post', 'Ranked Choice', 'Two-Round System'], ans: 1 },
      { q: 'How many seats are in the House of Commons?', opts: ['600', '650', '500', '700'], ans: 1 },
      { q: 'Who officially appoints the Prime Minister?', opts: ['The Speaker', 'The Monarch', 'The Public', 'The Cabinet'], ans: 1 }
    ]
  },
  {
    id: 'brazil',
    flag: '🇧🇷',
    name: 'Brazil',
    meta: 'Federal presidential republic · Electronic voting',
    nextElection: 'Next: Municipal Elections Oct 2024',
    accentColor: '#639922',
    globeCoords: { lat: -15, lon: -47 },
    steps: [
      { n: 1, title: 'Conventions', desc: 'Party conventions', date: 'Jul-Aug' },
      { n: 2, title: 'Registration', desc: 'Candidate registration', date: 'Aug' },
      { n: 3, title: 'Campaign', desc: 'Official campaign starts', date: 'Aug' },
      { n: 4, title: 'First Round', desc: 'Initial voting', date: 'Oct' },
      { n: 5, title: 'Second Round', desc: 'Runoff if needed', date: 'Oct' },
      { n: 6, title: 'Taking Office', desc: 'Winners inaugurated', date: 'Jan' }
    ],
    aiSummary: 'Brazil\'s elections are notable for their fully electronic voting system, which allows for extremely fast counting across a massive and diverse country. Voting is compulsory for literate citizens aged 18 to 70.',
    quiz: [
      { q: 'Is voting compulsory in Brazil?', opts: ['No', 'Yes, for all', 'Yes, for ages 18-70', 'Only for presidential elections'], ans: 2 },
      { q: 'What is unique about Brazil\'s counting process?', opts: ['Paper only', 'Fully electronic', 'Mail-in only', 'Counted by AI'], ans: 1 },
      { q: 'If no candidate gets 50%, what happens?', opts: ['Recount', 'Congress decides', 'Second Round Runoff', 'Coalition formed'], ans: 2 }
    ]
  },
  {
    id: 'france',
    flag: '🇫🇷',
    name: 'France',
    meta: 'Semi-presidential republic · Two-round system',
    nextElection: 'Next: Municipal 2026',
    accentColor: '#7F77DD',
    globeCoords: { lat: 46, lon: 2 },
    steps: [
      { n: 1, title: 'Announcement', desc: 'Snap election called', date: 'Jun 9 2024' },
      { n: 2, title: 'Campaign 1', desc: 'First round campaign', date: 'Jun 2024' },
      { n: 3, title: 'First Round', desc: 'Initial voting', date: 'Jun 30 2024' },
      { n: 4, title: 'Campaign 2', desc: 'Runoff campaign', date: 'Jul 1-5 2024' },
      { n: 5, title: 'Second Round', desc: 'Final voting', date: 'Jul 7 2024' },
      { n: 6, title: 'Assembly', desc: 'New assembly meets', date: 'Jul 18 2024' }
    ],
    aiSummary: 'The 2024 French snap legislative elections were highly consequential. France uses a two-round system where candidates needing a minimum percentage of votes to advance. The result was a hung parliament with three main blocs.',
    quiz: [
      { q: 'What voting system is primarily used?', opts: ['First-Past-The-Post', 'Proportional', 'Two-Round System', 'Ranked Choice'], ans: 2 },
      { q: 'What type of government system does France have?', opts: ['Parliamentary', 'Semi-presidential', 'Absolute Monarchy', 'Federal'], ans: 1 },
      { q: 'What happens in the second round?', opts: ['Top 2 candidates compete', 'Candidates over 12.5% compete', 'Electoral college votes', 'New candidates join'], ans: 1 }
    ]
  }
];
