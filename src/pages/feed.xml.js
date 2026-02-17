import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { buildExcerpt } from "../lib/content";

export async function GET(context) {
  const notes = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: "Notebook",
    description: "Notes on backend engineering, systems design, and things I am learning in public.",
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.description ?? buildExcerpt(note.body, 220),
      link: `/notes/${note.slug}/`
    }))
  });
}
