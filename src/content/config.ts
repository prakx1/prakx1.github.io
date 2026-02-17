import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    categories: z.array(z.string()).default([]),
    draft: z.boolean().optional()
  })
});

const project = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    externalUrl: z.string().optional()
  })
});

export const collections = {
  blog,
  project
};
