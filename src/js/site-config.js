import { siteConfig as rootSiteConfig } from "../../config/site-config.js";

const DEFAULT_CONFIG = {
  contact: {
    email: "placeholder@email.com",
    telephone: "+440000000000"
  },
  artist: {
    bio: "Influenced by the raw energy of placeholder artists, The Bangs Collective brings angular grooves, restless textures, and late-night static to every track."
  }
};

function mergeConfig(config) {
  return {
    contact: {
      email: config?.contact?.email || DEFAULT_CONFIG.contact.email,
      telephone: config?.contact?.telephone || DEFAULT_CONFIG.contact.telephone
    },
    artist: {
      bio: config?.artist?.bio || DEFAULT_CONFIG.artist.bio
    }
  };
}

export async function loadSiteConfig() {
  return mergeConfig(rootSiteConfig);
}
