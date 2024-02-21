import type { Reroute } from '@sveltejs/kit';

const reroutes: Record<string, string> = {
  '/twordle': '/games/twordle',
  '/testtest': '/games/twordle'
}
export const reroute: Reroute = ({ url }) => {
  if (url.pathname in reroutes) {
    return reroutes[url.pathname];
  }
};