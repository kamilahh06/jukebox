"use client";

import DraggableGems from "@/components/profile/DraggableGems"
// import { useRef } from "react"
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  User,
  Star,
  MessageSquare,
  Award,
  Loader2,
  Save,
  PenLine,
  Disc3,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  top_tracks: string[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  awarded_at: string;
}

interface Review {
  id: string;
  body: string;
  text?: string;
  created_at: string;
  tracks?: { title: string; artist: string; id: string } | null;
}

interface AnnotationRow {
  id: string;
  body: string;
  created_at: string;
  track_id: string;
  line_index: number;
  tracks?: { title: string; artist: string; id: string } | null;
}

export default function ProfilePage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationRow[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || "");
        setBio(profileData.bio || "");
      }

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, body, created_at, tracks(title, artist, id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setReviews((reviewData as Review[]) || []);

      let annotationData: AnnotationRow[] | null = null;
      const { data: withTracks } = await supabase
        .from("annotations")
        .select("id, body, created_at, track_id, line_index, tracks(title, artist, id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (withTracks?.length !== undefined) {
        annotationData = withTracks as AnnotationRow[];
      }
      if (!annotationData) {
        const { data: noTracks } = await supabase
          .from("annotations")
          .select("id, body, created_at, track_id, line_index")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        annotationData = (noTracks as AnnotationRow[]) || [];
      }
      setAnnotations(annotationData || []);

      const { data: badgeData } = await supabase
        .from("user_badges")
        .select("awarded_at, badges(id, name, description, icon, color)")
        .eq("user_id", user.id);
      setBadges(
        (badgeData || []).map((b: Record<string, unknown>) => ({
          ...(b.badges as Record<string, unknown>),
          awarded_at: b.awarded_at,
        })) as Badge[]
      );

      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
      return;
    }
    toast.success("Profile updated!");
    setEditing(false);
    setProfile({ ...profile, display_name: displayName, bio });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl text-foreground mb-2 font-bold tracking-wider">NOT SIGNED IN</h1>
        <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
        <Link href="/auth/login">
          <Button className="holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan">
            SIGN IN
          </Button>
        </Link>
      </div>
    );
  }

  // const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={pageRef} className="relative mx-auto w-full max-w-6xl px-4 py-10">
      {/* Draggable gems layer */}
      <DraggableGems containerRef={pageRef} />

      {/* Top bar: retro “browser window” header */}
      <div className="retro-window mb-6">
        <div className="retro-titlebar">
          <div className="retro-dots">
            <span className="retro-dot red" />
            <span className="retro-dot yellow" />
            <span className="retro-dot green" />
          </div>

          <div className="retro-url">
            <span className="retro-url-label">https://</span>
            <span className="retro-url-text">jukebox.fm/profile</span>
          </div>

          <div className="retro-chip">PROFILE</div>
        </div>

        <div className="retro-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="retro-avatar">
                {(profile.display_name || profile.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                {editing ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="retro-input"
                    />
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Bio"
                      className="retro-textarea"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="retro-h1">
                      {(profile.display_name || profile.username || "").toUpperCase()}
                    </h1>

                    {profile.username && profile.display_name && (
                      <p className="retro-sub">@{profile.username}</p>
                    )}

                    {profile.bio ? (
                      <p className="retro-bio">{profile.bio}</p>
                    ) : (
                      <p className="retro-bio muted">no bio yet — add one ✧</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="y2k-glow-btn"
                onClick={() => {
                  // Reset gems
                  window.dispatchEvent(new CustomEvent("jukebox:gems:reset"))
                }}
              >
                reset gems
              </button>

              {editing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="btn-press text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="holo-gradient text-background font-semibold hover:opacity-90 gap-1 btn-press"
                  >
                    <Save className="h-3 w-3" />
                    {saving ? "SAVING..." : "SAVE"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/stats">
                    <Button
                      size="sm"
                      className="holo-gradient text-background font-semibold hover:opacity-90 gap-1.5 btn-press neon-glow-cyan"
                    >
                      <BarChart2 className="h-3 w-3" />
                      My Stats
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="border-border/30 text-foreground hover:bg-secondary/60 gap-1 bg-transparent btn-press hover:border-primary/30 transition-all"
                  >
                    <PenLine className="h-3 w-3" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* BADGES */}
        <section className="retro-window">
          <div className="retro-titlebar small accent-cyan">
            <div className="retro-dots">
              <span className="retro-dot red" />
              <span className="retro-dot yellow" />
              <span className="retro-dot green" />
            </div>
            <div className="retro-chip">BADGES</div>
          </div>

          <div className="retro-body">
            {badges.length === 0 ? (
              <p className="retro-muted text-center py-6">
                No badges earned yet. Start reviewing and annotating!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="retro-pill"
                    style={{
                      borderLeftColor: badge.color,
                      borderLeftWidth: "3px",
                    }}
                  >
                    <span className="text-xs font-semibold text-white/90">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ACTIVITY */}
        <section className="retro-window">
          <div className="retro-titlebar small accent-violet">
            <div className="retro-dots">
              <span className="retro-dot red" />
              <span className="retro-dot yellow" />
              <span className="retro-dot green" />
            </div>
            <div className="retro-chip">ACTIVITY</div>
          </div>

          <div className="retro-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="retro-stat">
                <div className="retro-stat-num">{reviews.length}</div>
                <div className="retro-stat-label">REVIEWS</div>
              </div>
              <div className="retro-stat">
                <div className="retro-stat-num">{annotations.length}</div>
                <div className="retro-stat-label">ANNOTATIONS</div>
              </div>
            </div>
          </div>
        </section>

        {/* RECENT REVIEWS */}
        <section className="retro-window md:col-span-1">
          <div className="retro-titlebar small accent-magenta">
            <div className="retro-dots">
              <span className="retro-dot red" />
              <span className="retro-dot yellow" />
              <span className="retro-dot green" />
            </div>
            <div className="retro-chip">RECENT REVIEWS</div>
          </div>

          <div className="retro-body">
            {reviews.length === 0 ? (
              <div className="text-center py-6">
                <Disc3 className="h-6 w-6 text-white/40 mx-auto mb-2" />
                <p className="retro-muted">No reviews yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <Link
                    key={r.id}
                    href={r.tracks ? `/track/${r.tracks.id}` : "#"}
                    className="retro-cardlink"
                  >
                    <p className="retro-linktitle">
                      {r.tracks?.title} — {r.tracks?.artist}
                    </p>
                    <p className="retro-linkbody line-clamp-2">
                      {r.body ?? r.text ?? ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* RECENT ANNOTATIONS */}
        <section className="retro-window md:col-span-1">
          <div className="retro-titlebar small accent-lime">
            <div className="retro-dots">
              <span className="retro-dot red" />
              <span className="retro-dot yellow" />
              <span className="retro-dot green" />
            </div>
            <div className="retro-chip">RECENT ANNOTATIONS</div>
          </div>

          <div className="retro-body">
            {annotations.length === 0 ? (
              <div className="text-center py-6">
                <Disc3 className="h-6 w-6 text-white/40 mx-auto mb-2" />
                <p className="retro-muted">No annotations yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {annotations.map((a) => (
                  <Link
                    key={a.id}
                    href={
                      a.tracks ? `/track/${a.tracks.id}` : a.track_id ? `/track/${a.track_id}` : "#"
                    }
                    className="retro-cardlink"
                  >
                    {a.tracks ? (
                      <p className="retro-linktitle">
                        {a.tracks.title} — {a.tracks.artist}
                      </p>
                    ) : (
                      <p className="retro-linktitle">View track</p>
                    )}
                    <p className="retro-linkbody line-clamp-2">{a.body}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
