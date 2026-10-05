import { getCollection } from 'astro:content';

/**
 * Publishable quotes for one service.
 *
 * The permission rule lives here rather than in the component because two
 * places now depend on it — the component that renders the quotes, and the
 * layout that decides whether to show the section at all. A claim rule that
 * exists in two copies is a rule that will eventually disagree with itself.
 *
 * Section 11, item 4: a quote without written permission on file is treated as
 * if it does not exist. Not greyed out, not "pending" — absent.
 */
export async function getTestimonials(service: 'corporate' | 'private' | 'club' | 'brand') {
  return (await getCollection('testimonials')).filter(
    (t) => t.data.permissionOnFile && t.data.services.includes(service)
  );
}
