import { Button } from '@radix-ui/themes';
import type { ComponentProps } from 'react';

export interface Tool {
  id: string;
  image: string;
  title: string;
  description: string;
  disabled?: boolean;
  href?: string;
  pageDescription?: string;
  button: {
    highContrast?: boolean;
    text: string;
    color: ComponentProps<typeof Button>['color'];
  };
  significant?: boolean;
  branches?: string[];
}

export const tankopediaTool: Tool = {
  id: 'tankopedia',
  title: 'Tankopedia',
  description: 'Blitz tank encyclopedia',
  pageDescription:
    'Statistics, armor, and more for all tanks in World of Tanks Blitz',
  image: 'D8j6GZx',
  button: {
    text: 'Find your tank',
    color: 'purple',
  },
  significant: true,
  branches: ['main', 'dev', 'opentest'],
};

export const ratingTool: Tool = {
  id: 'rating',
  title: 'Rating',
  description: 'Full rating leaderboard',
  pageDescription:
    'Live and archived full rating leaderboard for World of Tanks Blitz',
  image: 'WEyMZH3',
  button: {
    text: 'View leaderboard',
    color: 'orange',
  },
  branches: ['main', 'dev'],
};

export const compareTool: Tool = {
  id: 'compare',
  title: 'Compare',
  description: 'Compare tank statistics',
  pageDescription:
    'Compare tanks statistics and loadouts in World of Tanks Blitz',
  image: 'O6VNl6e',
  button: {
    text: 'Compare tanks',
    color: 'crimson',
  },
  branches: ['main', 'dev', 'opentest'],
};

export const sessionTool: Tool = {
  // TODO: rename to tracker
  id: 'session',
  title: 'Session',
  description: 'Live session stats',
  pageDescription:
    'Track your stats in real time as you play World of Tanks Blitz',
  image: 'HdG9sTf',
  button: {
    text: 'Start tracking',
    color: 'blue',
  },
  branches: ['main', 'dev'],
};

export const discordTool: Tool = {
  id: 'discord',
  title: 'Discord bot',
  description: 'Stats right in Discord',
  href: 'https://discord.com/application-directory/1097673957865443370',
  image: '0bWE5hC',
  button: {
    text: 'Install now',
    color: 'indigo',
  },
};

export const moreTool: Tool = {
  id: 'more',
  title: 'More coming soon',
  description: "What we're making",
  href: 'https://discord.gg/nDt7AjGJQH',
  image: '1nPm6VI',
  button: {
    text: 'Join Discord',
    color: 'plum',
  },
};

export const playerStatsTool: Tool = {
  id: 'player-stats',
  title: 'Player stats',
  description: 'Periodical player statistics',
  pageDescription: 'Periodical player statistics in World of Tanks Blitz',
  button: {
    text: 'Lookup player',
    color: 'blue',
  },
  image: 'YelSOfT',
  href: '_', // TODO: remove this to re-enable link
  branches: ['main', 'dev'],
};

export const tankPerformanceTool: Tool = {
  id: 'performance',
  title: 'Performance',
  description: 'Tank performance statistics',
  pageDescription: 'Best tanks and their performances in World of Tanks Blitz',
  button: {
    text: 'View tanks',
    color: 'jade',
  },
  image: 'vOKFB03',
  branches: ['main', 'dev'],
};

export const embedTool: Tool = {
  id: 'embed',
  title: 'Embed',
  description: 'Embeds for streaming',
  pageDescription:
    'Create embeds for streaming World of Tanks Blitz with extreme customization',
  button: {
    text: 'Create',
    color: 'red',
  },
  image: 'Q0faRYg',
  branches: ['main', 'dev', 'opentest'],
  href: '',
};

export const homeTool: Tool = {
  id: '',
  title: 'Home',
  button: { color: 'blue', text: '' },
  description: '',
  image: 'rUPie9G',
};

export const TOOLS: Tool[] = [
  tankopediaTool,
  compareTool,
  tankPerformanceTool,
  sessionTool,
  embedTool,
  ratingTool,
];