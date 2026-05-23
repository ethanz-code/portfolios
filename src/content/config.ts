import { z, defineCollection } from "astro:content";

const projectLinkSchema = z.object({
    label: z.string(),
    url: z.string(),
});

const projectSchema = z.object({
    title: z.string(),
    description: z.string(),
    badge: z.string(),
    updatedDate: z.coerce.date(),
    category: z.enum(["featured", "content"]),
    order: z.number(),
    heroImage: z.string().optional(),
    heroImageLight: z.string().optional(),
    heroImageDark: z.string().optional(),
    coverImage: z.string().optional(),
    coverImageLight: z.string().optional(),
    coverImageDark: z.string().optional(),
    externalUrl: z.string().optional(),
    detailPage: z.boolean().default(false),
    links: z.array(projectLinkSchema).optional(),
    tags: z.array(z.string()).optional(),
});

const articleSchema = z.object({
    title: z.string(),
    description: z.string(),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
});

export type ProjectSchema = z.infer<typeof projectSchema>;
export type ArticleSchema = z.infer<typeof articleSchema>;

const projectCollection = defineCollection({ schema: projectSchema });
const articleCollection = defineCollection({ schema: articleSchema });

export const collections = {
    'projects': projectCollection,
    'articles': articleCollection,
}
