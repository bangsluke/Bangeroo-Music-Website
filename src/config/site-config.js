export const siteConfig = {
  contact: {
    email: "martinbangs@hotmail.com",
    phone: "+447903250331"
  },
  artist: {
    bio: "Influenced by the raw energy of placeholder artists, The Bangs Collective brings angular grooves, restless textures, and late-night static to every track."
  },
  streamingLinks: {
    spotify: "https://open.spotify.com/artist/0gXu1oMsNf8fnRY0NPCoSw",
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
  palettes: [
    {
      name: "Default",
      bgPrimary: "#000000",
      bgSecondary: "#132257",
      textPrimary: "#FFFFFF",
      accent: "#FF0000",
      accentSecondary: "#FFD700"
    },
    {
      name: "Midnight Gold",
      bgPrimary: "#0a0a1a",
      bgSecondary: "#1a1a3e",
      textPrimary: "#FFD700",
      accent: "#FF0000",
      accentSecondary: "#FFFFFF"
    },
    {
      name: "Concrete",
      bgPrimary: "#1a1a1a",
      bgSecondary: "#2d2d2d",
      textPrimary: "#BCABA0",
      accent: "#FFD700",
      accentSecondary: "#FF0000"
    }
  ],
  lyrics: [
    "Please forgive the clumsiness in all I say and do",
    "My distraction blurs my mind",
    "I know you scar more easily than I do",
    "But always know our scars align",
    "I couldn't swerve my feelings even if I wanted to",
    "And I don't",
    "I spin around your gravitational pull",
    "This is real"
  ],
  lyricFragments: {
    intervalMs: 9000,
    varianceMs: 3600,
    visibleDurationMs: 2700,
    visibleVarianceMs: 600
  },
  counterMilestones: {
    1: "You are the first. Legend.",
    10: "10 people have tuned in",
    50: "50 souls have entered the frequency",
    100: "100 legends have visited",
    500: "Half a thousand. We see you.",
    1000: "You are visitor 1,000 - tell no one"
  },
  guestbook: {
    maxLength: 100,
    cooldownSeconds: 5,
    readEndpoint: "/.netlify/functions/guestbook-read",
    writeEndpoint: "/.netlify/functions/guestbook-write"
  },
  visitorCounter: {
    endpoint: "/.netlify/functions/visitor-count"
  }
};
