import Link from "next/link";
import { Eye, MessageCircle, ThumbsUp } from "lucide-react";

type CardPost = {
  slug: string; title: string; summary: string; useCase: string; views: number; createdAt: Date;
  author: { name: string; username: string };
  category: { name: string; slug: string };
  tags: { tag: { name: string; slug: string } }[];
  votes: { value: string }[];
  _count: { comments: number };
};

export function PostCard({ post }: { post: CardPost }) {
  const score = post.votes.reduce((n, v) => n + (v.value === "USEFUL" ? 1 : -1), 0);
  return (
    <article className="card post-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <Link className="tag" href={`/categories/${post.category.slug}`}>{post.category.name}</Link>
        <span className="muted" style={{ fontSize: 12 }}>{new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(post.createdAt)}</span>
      </div>
      <Link href={`/posts/${post.slug}`}><h3>{post.title}</h3></Link>
      <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>{post.summary}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 13 }}>
        {post.tags.slice(0, 4).map(({ tag }) => <Link href={`/tags/${tag.slug}`} className="tag" key={tag.slug}>#{tag.name}</Link>)}
      </div>
      <div className="stats">
        <span><ThumbsUp size={14} style={{ display: "inline" }} /> {score}</span>
        <span><Eye size={14} style={{ display: "inline" }} /> {post.views}</span>
        <span><MessageCircle size={14} style={{ display: "inline" }} /> {post._count.comments}</span>
        <Link href={`/profile/${post.author.username}`} style={{ marginLeft: "auto" }}>por {post.author.name}</Link>
      </div>
    </article>
  );
}
