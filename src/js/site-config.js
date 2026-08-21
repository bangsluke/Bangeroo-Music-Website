import { siteConfig as appSiteConfig } from "../config/site-config.js";

const DEFAULT_CONFIG = {
  contact: {
    email: "placeholder@email.com",
    phone: "+440000000000"
  },
  artist: {
    name: "Bangeroo",
    bio: "Music is magical. Greedily listening to pretty much anything that is good across many music genres, Bangeroo ponders whether he can add to the vast oceans of wonderful tunes out there. Drawing from shallowest wells of ability, he explores different styles randomly and shares songs in the hope maybe one or two unsuspecting souls fall as prey.",
    bioClosing: "Enter if you dare....."
  },
  ep: {
    title: "Finally",
    blurb: "",
    genres: [],
    artwork: null,
    artworkNote: "Artwork for EP cover to be added when finalised"
  },
  influences: {
    intro: "",
    artists: [],
    outro: ""
  },
  credits: {
    intro: "",
    people: []
  },
  streamingLinks: {
    spotify: "https://open.spotify.com/artist/PLACEHOLDER_ID",
    soundcloud: "https://soundcloud.com/PLACEHOLDER",
    itunes: "https://music.apple.com/artist/PLACEHOLDER",
    amazonMusic: "https://music.amazon.co.uk/artists/PLACEHOLDER"
  },
  spotifyEmbed: {
    artistId: "PLACEHOLDER_ID",
    theme: 0
  },
  spotify: {
    nowPlayingEndpoint: "/.netlify/functions/spotify-now-playing",
    pollIntervalMs: 15000
  },
  palettes: [],
  lyrics: [],
  lyricFragments: {
    intervalMs: 9000,
    varianceMs: 3600,
    visibleDurationMs: 2700,
    visibleVarianceMs: 600
  },
  counterMilestones: {},
  guestbook: {
    maxLength: 100,
    cooldownSeconds: 60,
    readEndpoint: "/.netlify/functions/guestbook-read",
    writeEndpoint: "/.netlify/functions/guestbook-write"
  },
  visitorCounter: {
    endpoint: "/.netlify/functions/visitor-count"
  }
};

function mergeConfig(config) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    contact: {
      ...DEFAULT_CONFIG.contact,
      ...config?.contact
    },
    artist: {
      ...DEFAULT_CONFIG.artist,
      ...config?.artist
    },
    ep: {
      ...DEFAULT_CONFIG.ep,
      ...config?.ep
    },
    influences: {
      ...DEFAULT_CONFIG.influences,
      ...config?.influences
    },
    credits: {
      ...DEFAULT_CONFIG.credits,
      ...config?.credits
    },
    streamingLinks: {
      ...DEFAULT_CONFIG.streamingLinks,
      ...config?.streamingLinks
    },
    spotifyEmbed: {
      ...DEFAULT_CONFIG.spotifyEmbed,
      ...config?.spotifyEmbed
    },
    spotify: {
      ...DEFAULT_CONFIG.spotify,
      ...config?.spotify
    },
    lyricFragments: {
      ...DEFAULT_CONFIG.lyricFragments,
      ...config?.lyricFragments
    },
    guestbook: {
      ...DEFAULT_CONFIG.guestbook,
      ...config?.guestbook
    },
    visitorCounter: {
      ...DEFAULT_CONFIG.visitorCounter,
      ...config?.visitorCounter
    }
  };
}

export async function loadSiteConfig() {
  return mergeConfig(appSiteConfig);
}
