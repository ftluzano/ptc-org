import React, { useState } from 'react';
import { Calendar, Check, Heart, Share2, ShieldCheck, ImageOff } from 'lucide-react';
import { getOrgByCode } from '../config/org-config';
import { resolvePostImageUrl } from '../lib/mediaAssets';
import type { OrgPost } from '../types/portal';
import { OrgEmblem } from './OrgEmblem';

interface FacebookPostCardProps {
  post: OrgPost;
  showOrgLink?: boolean;
  onOpenOrg?: (orgCode: string) => void;
  onOpenLightbox?: (imageUrl: string, caption: string) => void;
  onLikeUpdated?: (postId: string, likesCount: number) => void;
}

function formatEventDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FacebookPostCard({
  post,
  showOrgLink = false,
  onOpenOrg,
  onOpenLightbox,
  onLikeUpdated,
}: FacebookPostCardProps) {
  const org = getOrgByCode(post.orgCode) ?? {
    code: post.orgCode,
    shortName: post.orgShortName,
    accentColor: '#1E3A8A',
  };
  const resolvedImg = resolvePostImageUrl(post.imageUrl);
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleToggleLike() {
    if (liking || post.status !== 'approved') return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    setLiking(true);

    try {
      const res = await fetch(`/api/posts/${post.orgCode}/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlike: !nextLiked }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likesCount);
        onLikeUpdated?.(post.id, data.likesCount);
      }
    } catch {
      // Keep optimistic fallback
    } finally {
      setLiking(false);
    }
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/org/${post.orgCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* Post Author Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <OrgEmblem org={org} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {showOrgLink && onOpenOrg ? (
                <button
                  type="button"
                  onClick={() => onOpenOrg(post.orgCode)}
                  className="text-sm font-semibold text-stone-900 hover:text-[#1E3A8A] hover:underline cursor-pointer truncate"
                >
                  {post.orgShortName} — {post.orgFullName}
                </button>
              ) : (
                <span className="text-sm font-semibold text-stone-900 truncate">
                  {post.orgShortName} — {post.orgFullName}
                </span>
              )}
            </div>
            {/* Unboxed metadata with typographic dot separators */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-stone-500 mt-0.5">
              <span>President {post.authorName}</span>
              <span aria-hidden="true">·</span>
              <span>Published {formatRelativeTime(post.reviewedAt || post.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                CESSCA Approved
              </span>
            </div>
          </div>
        </div>

        <span className="font-mono text-[11px] text-stone-400 tabular-nums shrink-0 pt-0.5">
          {post.letterRef}
        </span>
      </div>

      {/* Event Headline & Caption Body */}
      <div className="px-5 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#1E3A8A]">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Event Date: {formatEventDate(post.eventDate)}</span>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 leading-snug">{post.title}</h3>
        <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-line">
          {post.caption}
        </p>
      </div>

      {/* Media Attachment */}
      {resolvedImg && !imgError && (
        <div className="bg-stone-100 border-y border-stone-200">
          <button
            type="button"
            onClick={() => onOpenLightbox?.(resolvedImg, post.title)}
            className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] cursor-zoom-in"
          >
            <img
              src={resolvedImg}
              alt={post.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full max-h-[440px] object-cover"
            />
          </button>
        </div>
      )}

      {resolvedImg && imgError && (
        <div className="bg-stone-100 border-y border-stone-200 py-12 px-6 flex flex-col items-center justify-center text-stone-400 gap-2">
          <ImageOff className="w-6 h-6" />
          <span className="text-xs">{post.title}</span>
        </div>
      )}

      {/* Facebook-style Engagement Bar */}
      <div className="px-5 py-3 flex items-center justify-between gap-4 border-t border-stone-100 text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void handleToggleLike()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              liked
                ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
                : 'hover:bg-stone-100 text-stone-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-[#1E3A8A] text-[#1E3A8A]' : ''}`} />
            <span className="tabular-nums">{likesCount}</span>
            <span>{likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copy Page Link</span>
              </>
            )}
          </button>
        </div>

        {showOrgLink && onOpenOrg && (
          <button
            type="button"
            onClick={() => onOpenOrg(post.orgCode)}
            className="text-xs font-medium text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Visit {post.orgShortName} Page →
          </button>
        )}
      </div>
    </article>
  );
}
