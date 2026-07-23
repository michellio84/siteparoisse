const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const root = process.cwd();
const sourcesDir = path.join(root, "content", "videos", "sources");
const selectionsDir = path.join(root, "content", "videos", "selections");
const outputDir = path.join(root, "data");
const apiKey = process.env.YOUTUBE_API_KEY;

function readCollection(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => {
      const { data } = matter(fs.readFileSync(path.join(directory, filename), "utf8"));
      return { ...data, slug: filename.replace(/\.md$/, "") };
    });
}

function videoIdFromUrl(url = "") {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^?&/]+)/);
  return match ? match[1] : "";
}

async function youtube(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`YouTube API ${response.status}`);
  return response.json();
}

async function uploadsPlaylist(source) {
  if (source.source_type === "playlist") {
    return source.youtube_id || (source.url.match(/[?&]list=([^&]+)/) || [])[1];
  }
  const channelId = source.youtube_id;
  if (!channelId) return null;
  const result = await youtube("channels", { part: "contentDetails", id: channelId });
  return result.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
}

async function latestForSource(source) {
  const playlistId = await uploadsPlaylist(source);
  if (!playlistId) return [];
  const result = await youtube("playlistItems", {
    part: "snippet,contentDetails,status",
    playlistId,
    maxResults: String(Math.max(1, Math.min(Number(source.limit) || 3, 6)))
  });
  return (result.items || [])
    .filter((item) => item.status?.privacyStatus !== "private")
    .map((item) => ({
      id: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId,
      title: item.snippet?.title,
      publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt,
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url,
      channel: item.snippet?.videoOwnerChannelTitle || source.title,
      source: source.slug,
      sourceUrl: source.url,
      category: source.category,
      audience: source.audience || ["Tous"]
    }))
    .filter((video) => video.id && video.title && video.title !== "Deleted video");
}

async function enrichSelections(selections) {
  const visible = selections.filter((selection) => selection.visible !== false);
  if (!apiKey || !visible.length) return visible.map((selection) => ({
    ...selection,
    id: videoIdFromUrl(selection.url),
    thumbnail: videoIdFromUrl(selection.url) ? `https://i.ytimg.com/vi/${videoIdFromUrl(selection.url)}/hqdefault.jpg` : ""
  }));
  const ids = visible.map((selection) => videoIdFromUrl(selection.url)).filter(Boolean);
  if (!ids.length) return visible;
  const result = await youtube("videos", { part: "snippet,status", id: ids.join(",") });
  const metadata = new Map((result.items || []).map((item) => [item.id, item]));
  return visible.map((selection) => {
    const id = videoIdFromUrl(selection.url);
    const item = metadata.get(id);
    return {
      ...selection,
      id,
      title: selection.title || item?.snippet?.title,
      channel: item?.snippet?.channelTitle || "",
      thumbnail: item?.snippet?.thumbnails?.high?.url || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "")
    };
  }).filter((selection) => selection.id);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const sources = readCollection(sourcesDir).filter((source) => source.visible !== false);
  const selections = await enrichSelections(readCollection(selectionsDir));
  fs.writeFileSync(path.join(outputDir, "video-sources.json"), JSON.stringify(sources, null, 2));
  fs.writeFileSync(path.join(outputDir, "video-selections.json"), JSON.stringify(selections, null, 2));

  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY absent : conservation du cache automatique existant.");
    if (!fs.existsSync(path.join(outputDir, "videos-cache.json"))) {
      fs.writeFileSync(path.join(outputDir, "videos-cache.json"), "[]\n");
    }
    return;
  }

  const videos = [];
  for (const source of sources) {
    try {
      videos.push(...await latestForSource(source));
    } catch (error) {
      console.warn(`Source ${source.title} ignorée : ${error.message}`);
    }
  }
  fs.writeFileSync(path.join(outputDir, "videos-cache.json"), JSON.stringify(videos, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
