type ChatterWorker = Record<string, Record<string, string>>;

export async function initialFetches(channel: string, bttvEmoteCache: Array<bttvEmote>, ffzCache: Array<ffzEmote>, badgeData: BadgeData) {
  const chatterWorker = await fetch(`https://chatter-worker.colloquial.workers.dev/c/${channel}`)
    .then((res) => res.json())
    .then((data) => {
      return data as ChatterWorker;
    });
  let userID = chatterWorker.userID.id;
  if (chatterWorker.bits) {
    Object.keys(chatterWorker.bits).forEach((k) => {
      if (badgeData.bits.versions[k]) {
        badgeData.bits.versions[k].image_url_2x = chatterWorker.bits[k]
      } else {
        badgeData.bits.versions[k] = {
          image_url_2x: chatterWorker.bits[k],
        };
      }

    });
  }
  if (chatterWorker.subscriber) {
    Object.keys(chatterWorker.subscriber).forEach((k) => {
      if (badgeData.subscriber.versions[k]) {
        badgeData.subscriber.versions[k].image_url_2x = chatterWorker.subscriber[k];
      } else {
        badgeData.subscriber.versions[k] = {
          image_url_2x: chatterWorker.subscriber[k],
        };
      }
    });
  }
  await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userID}`)
    .then((res) => res.json())
    .then((data) => {
      for (let i in data.channelEmotes) {
        bttvEmoteCache.push(data.channelEmotes[i]);
      }
      for (let i in data.sharedEmotes) {
        bttvEmoteCache.push(data.sharedEmotes[i]);
      }
    })
    .catch(error => console.error(error));
}