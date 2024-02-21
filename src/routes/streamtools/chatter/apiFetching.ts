type ChatterWorker = Record<string, Record<string, string>>;

function storeBTTVEmotes(data: Array<bttvEmote>, bttvEmoteCache: Map<string, string>) {
  data.forEach((e) => {
    bttvEmoteCache.set(e.code, `https://cdn.betterttv.net/emote/${e.id}/3x`)
  })
}

function storeFFZEmotes(data: Array<ffzEmote>, ffzCache: Map<string, string>) {
  data.forEach(e => {
    ffzCache.set(e.name, e.urls[2]);
  })
}


export async function initialFetches(channel: string, bttvEmoteCache: Map<string, string>, ffzCache: Map<string, string>, badgeData: BadgeData) {
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
  await fetch("https://api.betterttv.net/3/cached/emotes/global")
    .then((response) => response.json())
    .then((data: Array<bttvEmote>) => {
      storeBTTVEmotes(data, bttvEmoteCache)
    })
    .catch((error) => console.error(error));
  await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userID}`)
    .then((res) => res.json())
    .then((data) => {
      storeBTTVEmotes(data.channelEmotes, bttvEmoteCache)
      storeBTTVEmotes(data.sharedEmotes, bttvEmoteCache)
    })
    .catch(error => console.error(error));
  await fetch(`https://api.frankerfacez.com/v1/room/${channel}`)
    .then((response) => response.json())
    .then((data) => {
      for (let [key, value] of Object.entries(data.sets as ffzData)) {
        storeFFZEmotes(value.emoticons, ffzCache);
      }
    })
    .catch((error) => console.error(error));
  fetch(`https://api.frankerfacez.com/v1/set/global`)
    .then((response) => response.json())
    .then((data) => {
      for (let [key, value] of Object.entries(data.sets as ffzData)) {
        storeFFZEmotes(value.emoticons, ffzCache);
      }
    })
    .catch((error) => console.error(error));
}