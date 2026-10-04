import { DEFAULT_SETTINGS, type Settings } from '@/lib/domain/types';

// The shipped look (ADMIN-DESIGN-SPEC §8.9), plus the owner's GitHub username so the heat map
// shows (the defaults leave it empty, which hides it).
export const settings: Settings = { ...DEFAULT_SETTINGS, githubUsername: 'Tanishk-Saxena' };
