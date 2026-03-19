import { siteConfig as appSiteConfig } from "../config/site-config.js";

const DEFAULT_CONFIG = {
  contact: {
    email: "placeholder@email.com",
    phone: "+440000000000"
  },
  artist: {
    bio: "Influenced by the raw energy of placeholder artists, The Bangs Collective brings angular grooves, restless textures, and late-night static to every track."
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
    pollIntervalMs: 30000
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
