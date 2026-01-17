/**
 * Spotify Taste Profile Analyzer
 * Analyzes user's playlists and listening habits to generate a personality-based profile
 * Similar to Myers-Briggs 16 personality types
 */

// Generate personality-based profile names (inspired by Myers-Briggs)
const PERSONALITY_PROFILES = {
  "High-Energy-Eclectic-Contemporary-Uplifting": {
    name: "The Trendsetter",
    emoji: "🎯",
    description:
      "You're constantly discovering new sounds and living for the moment. Your playlists are a vibrant mix of cutting-edge tracks that keep you energized.",
  },
  "High-Energy-Eclectic-Contemporary-Introspective": {
    name: "The Explorer",
    emoji: "🧭",
    description:
      "You blend thoughtful introspection with adventurous taste. You seek out new artists but appreciate the depth of their artistry.",
  },
  "High-Energy-Eclectic-Classic-Uplifting": {
    name: "The Fusion Master",
    emoji: "⚡",
    description:
      "You appreciate music across all eras and genres. Your energy is infectious, blending timeless classics with hidden gems.",
  },
  "High-Energy-Eclectic-Classic-Introspective": {
    name: "The Philosopher",
    emoji: "🎭",
    description:
      "You're a deep thinker who loves exploring music's history and diverse expressions. Your taste is intellectually adventurous.",
  },
  "High-Energy-Focused-Contemporary-Uplifting": {
    name: "The Pop Star",
    emoji: "⭐",
    description:
      "You know what you like and you like it loud. Current hits and feel-good anthems are your soundtrack.",
  },
  "High-Energy-Focused-Contemporary-Introspective": {
    name: "The Curator",
    emoji: "🎨",
    description:
      "You carefully select modern music that resonates emotionally. Quality over quantity is your motto.",
  },
  "High-Energy-Focused-Classic-Uplifting": {
    name: "The Classic Enthusiast",
    emoji: "🏆",
    description:
      "You're devoted to timeless hits and proven favorites. You know exactly what makes you feel alive.",
  },
  "High-Energy-Focused-Classic-Introspective": {
    name: "The Nostalgic Soul",
    emoji: "🕰️",
    description:
      "Classic music speaks to your heart. You find profound meaning in the songs that have stood the test of time.",
  },
  "Mellow-Eclectic-Contemporary-Uplifting": {
    name: "The Optimist",
    emoji: "🌟",
    description:
      "You're positive and open-minded, seeking out new sounds that make you smile. Your vibe is good, your taste is diverse.",
  },
  "Mellow-Eclectic-Contemporary-Introspective": {
    name: "The Mystic",
    emoji: "🌙",
    description:
      "You explore contemporary music with a contemplative spirit. Your playlists are for quiet moments and deep thinking.",
  },
  "Mellow-Eclectic-Classic-Uplifting": {
    name: "The Peacemaker",
    emoji: "☮️",
    description:
      "You're drawn to soothing sounds from across the musical spectrum. Your taste brings calm and joy.",
  },
  "Mellow-Eclectic-Classic-Introspective": {
    name: "The Dreamer",
    emoji: "💭",
    description:
      "You're a musical daydreamer who roams across genres and eras. Your playlists are a meditation.",
  },
  "Mellow-Focused-Contemporary-Uplifting": {
    name: "The Chill Influencer",
    emoji: "😎",
    description:
      "You know what modern chill vibes work, and you stick with them. Your taste is refined and feel-good.",
  },
  "Mellow-Focused-Contemporary-Introspective": {
    name: "The Indie Lover",
    emoji: "🎵",
    description:
      "You carefully select contemporary indie and alternative tracks that speak to your soul.",
  },
  "Mellow-Focused-Classic-Uplifting": {
    name: "The Vintage Lover",
    emoji: "🎬",
    description:
      "You love classic music and know how to relax. Your taste is timeless and your vibe is warm.",
  },
  "Mellow-Focused-Classic-Introspective": {
    name: "The Audiophile",
    emoji: "🎧",
    description:
      "You appreciate the classics and know what you want to hear. Your playlists are carefully crafted personal refuges.",
  },
};

/**
 * Analyzes user's listening data to score dimensions
 * Uses Top Artists, Top Tracks, and Recently Played instead of deprecated audio features
 * @param {String} token - Spotify API token
 * @returns {Promise<Object>} - Analysis results with dimensions and profile
 */
export const analyzeListeningProfile = async (token) => {
  try {
    // Fetch user's listening data from multiple endpoints
    const [topArtistsShort, topArtistsMedium, topTracksShort, topTracksMedium, recentlyPlayed] =
      await Promise.all([
        fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

    // Combine all data
    const allArtists = [...(topArtistsShort.items || []), ...(topArtistsMedium.items || [])];
    const allTracks = [
      ...(topTracksShort.items || []),
      ...(topTracksMedium.items || []),
      ...(recentlyPlayed.items?.map((item) => item.track) || []),
    ];

    if (allTracks.length === 0 && allArtists.length === 0) {
      throw new Error("No listening history found. Listen to some music first!");
    }

    // Calculate dimension scores
    const scores = calculateDimensionScores(allArtists, allTracks);
    const profile = generateProfile(scores);

    // Get top 10 artists and tracks from last month (short_term)
    const topArtists = (topArtistsShort.items || []).slice(0, 10);
    const topTracks = (topTracksShort.items || []).slice(0, 10);

    return {
      profile,
      scores,
      topArtists,
      topTracks,
      artistCount: allArtists.length,
      trackCount: allTracks.length,
    };
  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw error;
  }
};

/**
 * Calculate scores for each dimension based on listening data
 * @param {Array} artists - User's top artists
 * @param {Array} tracks - User's top and recent tracks
 */
const calculateDimensionScores = (artists, tracks) => {
  if (artists.length === 0 && tracks.length === 0) {
    return {
      energy: 0.5,
      diversity: 0.5,
      modernity: 0.5,
      mood: 0.5,
    };
  }

  // Energy: based on artist popularity and track tempo indicators
  // Higher popularity artists tend to have more energetic music
  const energyScore = calculateEnergyScore(artists, tracks);

  // Diversity: based on genre variety and unique artists
  const diversityScore = calculateDiversityScore(artists, tracks);

  // Modernity: based on release dates and artist activity
  const modernityScore = calculateModernityScore(artists, tracks);

  // Mood: based on track popularity and artist genres
  const moodScore = calculateMoodScore(artists, tracks);

  return {
    energy: Math.min(Math.max(energyScore, 0), 1),
    diversity: Math.min(Math.max(diversityScore, 0), 1),
    modernity: Math.min(Math.max(modernityScore, 0), 1),
    mood: Math.min(Math.max(moodScore, 0), 1),
  };
};

/**
 * Calculate energy score based on artist popularity and genre indicators
 */
const calculateEnergyScore = (artists, tracks) => {
  if (artists.length === 0 && tracks.length === 0) return 0.5;

  let energyIndicators = 0;
  let count = 0;

  // High-energy genres
  const energeticGenres = [
    "rock",
    "metal",
    "punk",
    "edm",
    "electronic",
    "dance",
    "hip hop",
    "rap",
    "pop",
    "house",
    "techno",
  ];
  const mellowGenres = [
    "ambient",
    "classical",
    "jazz",
    "folk",
    "acoustic",
    "indie folk",
    "chill",
    "lo-fi",
  ];

  // Analyze artist genres
  artists.forEach((artist) => {
    if (artist.genres && artist.genres.length > 0) {
      const hasEnergeticGenre = artist.genres.some((g) =>
        energeticGenres.some((eg) => g.toLowerCase().includes(eg)),
      );
      const hasMellowGenre = artist.genres.some((g) =>
        mellowGenres.some((mg) => g.toLowerCase().includes(mg)),
      );

      if (hasEnergeticGenre) energyIndicators += 0.8;
      else if (hasMellowGenre) energyIndicators += 0.2;
      else energyIndicators += 0.5;
      count++;
    }
  });

  // Higher popularity generally correlates with more energetic music
  const popularityScore =
    artists.length > 0
      ? artists.reduce((sum, a) => sum + (a.popularity || 50), 0) / (artists.length * 100)
      : 0.5;

  return count > 0 ? (energyIndicators / count) * 0.7 + popularityScore * 0.3 : popularityScore;
};

/**
 * Calculate diversity score based on genre variety
 */
const calculateDiversityScore = (artists, tracks) => {
  if (artists.length === 0 && tracks.length === 0) return 0.5;

  // Count unique genres
  const allGenres = new Set();
  artists.forEach((artist) => {
    if (artist.genres) {
      artist.genres.forEach((genre) => allGenres.add(genre));
    }
  });

  // Count unique artists
  const uniqueArtistIds = new Set();
  tracks.forEach((track) => {
    if (track.artists) {
      track.artists.forEach((artist) => uniqueArtistIds.add(artist.id));
    }
  });

  // More genres and artists = higher diversity
  const genreScore = Math.min(allGenres.size / 20, 1); // 20+ genres = max diversity
  const artistScore = Math.min(uniqueArtistIds.size / 30, 1); // 30+ artists = max diversity

  return genreScore * 0.6 + artistScore * 0.4;
};

/**
 * Calculate modernity score based on release dates
 */
const calculateModernityScore = (artists, tracks) => {
  if (tracks.length === 0) return 0.5;

  const currentYear = new Date().getFullYear();
  let totalScore = 0;
  let count = 0;

  tracks.forEach((track) => {
    if (track.album?.release_date) {
      const year = parseInt(track.album.release_date.substring(0, 4));
      if (!isNaN(year)) {
        // Scale: 1970 = 0, current year = 1
        const score = Math.max(0, (year - 1970) / (currentYear - 1970));
        totalScore += score;
        count++;
      }
    }
  });

  return count > 0 ? totalScore / count : 0.5;
};

/**
 * Calculate mood score based on genres and popularity
 */
const calculateMoodScore = (artists, tracks) => {
  if (artists.length === 0 && tracks.length === 0) return 0.5;

  let moodIndicators = 0;
  let count = 0;

  // Uplifting genres
  const upliftingGenres = ["pop", "dance", "happy", "party", "summer", "tropical", "disco", "funk"];
  const introspectiveGenres = [
    "sad",
    "melancholic",
    "indie",
    "alternative",
    "emo",
    "post-rock",
    "shoegaze",
  ];

  artists.forEach((artist) => {
    if (artist.genres && artist.genres.length > 0) {
      const hasUpliftingGenre = artist.genres.some((g) =>
        upliftingGenres.some((ug) => g.toLowerCase().includes(ug)),
      );
      const hasIntrospectiveGenre = artist.genres.some((g) =>
        introspectiveGenres.some((ig) => g.toLowerCase().includes(ig)),
      );

      if (hasUpliftingGenre) moodIndicators += 0.8;
      else if (hasIntrospectiveGenre) moodIndicators += 0.2;
      else moodIndicators += 0.5;
      count++;
    }
  });

  // Track popularity can indicate mood (popular = uplifting)
  const popularityScore =
    tracks.length > 0
      ? tracks.reduce((sum, t) => sum + (t.popularity || 50), 0) / (tracks.length * 100)
      : 0.5;

  return count > 0 ? (moodIndicators / count) * 0.6 + popularityScore * 0.4 : popularityScore;
};

/**
 * Generate personality profile based on dimension scores
 */
const generateProfile = (scores) => {
  const energyLabel = scores.energy > 0.5 ? "High-Energy" : "Mellow";
  const diversityLabel = scores.diversity > 0.5 ? "Eclectic" : "Focused";
  const modernityLabel = scores.modernity > 0.5 ? "Contemporary" : "Classic";
  const moodLabel = scores.mood > 0.5 ? "Uplifting" : "Introspective";

  const profileKey = `${energyLabel}-${diversityLabel}-${modernityLabel}-${moodLabel}`;
  const profileData = PERSONALITY_PROFILES[profileKey] || {
    name: "The Music Lover",
    emoji: "🎵",
    description: "Your taste is uniquely yours. Keep exploring and enjoying the music you love.",
  };

  return {
    ...profileData,
    dimensions: {
      energy: { score: scores.energy, label: energyLabel },
      diversity: { score: scores.diversity, label: diversityLabel },
      modernity: { score: scores.modernity, label: modernityLabel },
      mood: { score: scores.mood, label: moodLabel },
    },
  };
};

export default analyzeListeningProfile;
