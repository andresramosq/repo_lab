import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { postInclude, score } from "@/lib/content";
import { PostActions } from "@/components/post-actions";
import { PostCard } from "@/components/post-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await db.post.findUnique({ where: { slug: (await params).slug }, select: { title: true, summary: true } });
  return post ? { title: post.title, description: post.summary, openGraph: { title: post.title, description: post.summary } } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getAuth();
  const post = await db.post.findUnique({
    where: { slug },
    include: { ...postInclude, comments: { include: { user: { select: { name: true, username: true } } }, orderBy: { createdAt: "asc" } } },
  });
  if (!post || (post.status === "DRAFT" && post.authorId !== session?.user.id && session?.user.role !== "ADMIN")) notFound();
  await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  const tagIds = post.tags.map(x => x.tagId);
  const related = await db.post.findMany({
    where: { id: { not: post.id }, status: "PUBLISHED", tags: { some: { tagId: { in: tagIds } } } },
    include: postInclude, take: 3,
  });
  const ownVote = post.votes.find(v => v.userId === session?.user.id)?.value;
  const isOwner = post.authorId === session?.user.id || session?.user.role === "ADMIN";
  return (
    <main className="container" style={{ maxWidth: 920, padding: "45px 0" }}>
      <article>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="tag" href={`/categories/${post.category.slug}`}>{post.category.name}</Link>
          {post.tags.map(({ tag }) => <Link className="tag" href={`/tags/${tag.slug}`} key={tag.id}>#{tag.name}</Link>)}
        </div>
        <h1 style={{ fontSize: "clamp(35px,6vw,58px)", letterSpacing: "-.04em", lineHeight: 1.03 }}>{post.title}</h1>
        <p className="muted" style={{ fontSize: 19, lineHeight: 1.6 }}>{post.summary}</p>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 20 }}>
          <Link href={`/profile/${post.author.username}`}><strong>{post.author.name}</strong> · @{post.author.username}</Link>
          <span className="muted"><ThumbsUp size={15} style={{ display: "inline" }} /> {score(post.votes)}</span>
          <span className="muted"><Eye size={15} style={{ display: "inline" }} /> {post.views + 1}</span>
          <span className="muted"><MessageCircle size={15} style={{ display: "inline" }} /> {post.comments.length}</span>
          {isOwner && <Link className="btn secondary" style={{ marginLeft: "auto" }} href={`/posts/${post.slug}/edit`}>Editar</Link>}
        </div>
        <div className="card" style={{ padding: 22, marginTop: 25 }}><strong>Úsalo cuando</strong><p style={{ marginBottom: 0 }}>{post.useCase}</p></div>
        <h2 style={{ marginTop: 34 }}>Prompt listo para usar</h2>
        <PostActions postId={post.id} prompt={post.prompt} initialVote={ownVote} favorite={post.favorites.some(f => f.userId === session?.user.id)} />
        {post.images.length > 0 && <div style={{ display: "grid", gap: 14, marginTop: 28 }}>{post.images.map(image => <Image key={image.id} src={image.url} alt={image.alt || post.title} width={900} height={500} style={{ width: "100%", height: "auto", borderRadius: 14 }} />)}</div>}
        <div className="markdown" style={{ fontSize: 17, marginTop: 36 }}><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown></div>
      </article>
      <section style={{ marginTop: 45 }}><h2>Comentarios ({post.comments.length})</h2>
        {post.comments.length ? post.comments.map(comment => <div key={comment.id} className="card" style={{ padding: 18, marginBottom: 10 }}><strong>{comment.user.name}</strong> <span className="muted">@{comment.user.username}</span><p style={{ whiteSpace: "pre-wrap" }}>{comment.body}</p></div>) : <p className="muted">Todavía no hay comentarios.</p>}
      </section>
      {related.length > 0 && <section style={{ marginTop: 45 }}><h2>También puede servirte</h2><div className="grid-posts">{related.map(item => <PostCard post={item} key={item.id} />)}</div></section>}
    </main>
  );
}
