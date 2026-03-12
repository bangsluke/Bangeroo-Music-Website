const DEFAULT_CONFIG = {
  contact: {
    email: "placeholder@email.com",
    telephone: "+440000000000"
  },
  artist: {
    bio: "Influenced by the raw energy of placeholder artists, The Bangs Collective brings angular grooves, restless textures, and late-night static to every track."
  }
};

export async function loadSiteConfig() {
  try {
    const response = await fetch("/config/site-config.json", { cache: "no-store" });
    if (!response.ok) {
      return DEFAULT_CONFIG;
    }

    const config = await response.json();
    return {
      contact: {
        email: config?.contact?.email || DEFAULT_CONFIG.contact.email,
        telephone: config?.contact?.telephone || DEFAULT_CONFIG.contact.telephone
      },
      artist: {
        bio: config?.artist?.bio || DEFAULT_CONFIG.artist.bio
      }
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
