

import { createClient } from "@/lib/supabase/server";
import { TrackCard } from "@/components/track-card";
import { SectionHeader } from "@/components/section-header";
import { TopMenu } from "@/components/home/TopMenu";
import { NowPlayingWidget } from "@/components/home/NowPlayingWidget";
import { BrowseTracksCarousel } from "@/components/home/BrowseTracksCarousel";
import { CdCaseCarousel } from "@/components/home/CdCaseCarousel";
import { ArrowRight, Disc3, MessageSquare, Layers, Users, Headphones, PenLine, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import star1 from "@/components/canva/star1.png";
import jukebox1 from "@/components/canva/jukebox1.png";
import { Y2KStarfield } from "@/components/y2k/Y2KStarfield";

const PAGE_SIZE = 30;

const features = [
  {
    icon: Disc3,
    title: "Letterboxd for Music",
    description: "Rate and review every track you listen to. Build your personal listening history and share your musical journey.",
    color: "cyan" as const,
  },
  {
    icon: Users,
    title: "Community & Discovery",
    description: "Connect with fellow music lovers. Find new artists through community reviews, curated playlists, and trending discussions.",
    color: "violet" as const,
  },
  {
    icon: PenLine,
    title: "Line-by-Line Annotations",
    description: "Break down lyrics and meaning with community-powered annotations. Add context, interpretations, and references to every line.",
    color: "magenta" as const,
  },
];

const colorMap = {
  cyan: {
    border: "border-[rgba(91,234,214,0.25)]",
    glow: "shadow-[0_0_20px_rgba(91,234,214,0.12)]",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(91,234,214,0.2)]",
    iconBg: "bg-[rgba(91,234,214,0.1)]",
    iconColor: "text-[#5BEAD6]",
  },
  violet: {
    border: "border-[rgba(168,85,247,0.25)]",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.12)]",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]",
    iconBg: "bg-[rgba(168,85,247,0.1)]",
    iconColor: "text-[#A855F7]",
  },
  magenta: {
    border: "border-[rgba(255,45,155,0.25)]",
    glow: "shadow-[0_0_20px_rgba(255,45,155,0.12)]",
    hoverGlow: "hover:shadow-[0_0_30px_rgba(255,45,155,0.2)]",
    iconBg: "bg-[rgba(255,45,155,0.1)]",
    iconColor: "text-[#FF2D9B]",
  },
};

export default async function HomePage(props: {
  searchParams?: Promise<{ page?: string }> | { page?: string };
}) {
  const { searchParams } = props;
  let pageParam: string | undefined;
  if (searchParams == null) {
    pageParam = undefined;
  } else if (typeof (searchParams as Promise<unknown>).then === "function") {
    pageParam = (await (searchParams as Promise<{ page?: string }>))?.page;
  } else {
    pageParam = (searchParams as { page?: string })?.page;
  }
  const page = Math.max(1, parseInt(String(pageParam ?? "1"), 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  type TrackRow = {
    id: string;
    title: string;
    artist: string;
    cover_url?: string | null;
    tags?: string[] | null;
    average_rating?: number | null;
    total_ratings?: number | null;
  };
  let topTracks: TrackRow[] = [];
  let trendingTracks: TrackRow[] = [];
  let playlists: Array<{ id: string; title: string | null; description: string | null }> = [];
  let browseTracks: TrackRow[] = [];
  let total = 0;
  let forYouTracks: TrackRow[] = [];
  let userGenrePrefs: string[] = [];

  try {
    const supabase = await createClient();
    const trackCols = "id, title, artist, cover_url, average_rating, total_ratings";
    const [topRes, trendRes, playRes, browseRes] = await Promise.all([
      supabase.from("tracks").select(trackCols).order("id", { ascending: false }).limit(6),
      supabase.from("tracks").select(trackCols).order("id", { ascending: false }).limit(4),
      supabase.from("playlists").select("id, title, description").order("id", { ascending: false }).limit(4),
      supabase.from("tracks").select(trackCols, { count: "exact" }).order("id", { ascending: false }).range(from, to),
    ]);
    topTracks = (topRes.data ?? []) as TrackRow[];
    trendingTracks = (trendRes.data ?? []) as TrackRow[];
    playlists = playRes.data ?? [];
    browseTracks = (browseRes.data ?? []) as TrackRow[];
    total = browseRes.count ?? 0;

    // Personalized "For You" section — isolated so failures don't affect track display
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("genre_preferences")
          .eq("id", user.id)
          .single();
        if (profile?.genre_preferences && profile.genre_preferences.length > 0) {
          userGenrePrefs = profile.genre_preferences as string[];
          const { data: fyTracks } = await supabase
            .from("tracks")
            .select("*")
            .overlaps("tags", userGenrePrefs)
            .order("average_rating", { ascending: false })
            .limit(6);
          forYouTracks = (fyTracks ?? []) as TrackRow[];
        }
      }
    } catch {
      // For You section is optional — don't let it break the page
    }
  } catch {
    // Page still renders with empty data if Supabase or createClient fails
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const nowPlayingTracks = topTracks.slice(0, 4).map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    coverUrl: t.cover_url && String(t.cover_url).trim() ? t.cover_url : null,
    percentLiked: t.average_rating != null ? Math.round(Number(t.average_rating) * 20) : undefined,
  }));

  return (
    // <div className="relative min-h-screen">
    //   {/* Main page background: soft purple/blue gradient with Northern Lights cloud glow */}
    //   <div
    //     className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    //     aria-hidden="true"
    //   >
    //     <div
    //       className="absolute inset-0"
    //       style={{
    //         background: "linear-gradient(165deg, #1a0a2e 0%, #16213e 25%, #0f3460 50%, #1a0a2e 75%, #0d0221 100%)",
    //       }}
    //     />
    //     <div
    //       className="absolute inset-0 opacity-40"
    //       style={{
    //         background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(129, 140, 248, 0.35), transparent 60%), radial-gradient(ellipse 60% 80% at 90% 40%, rgba(139, 92, 246, 0.25), transparent 50%), radial-gradient(ellipse 70% 60% at 10% 80%, rgba(59, 130, 246, 0.2), transparent 55%)",
    //       }}
    //     />
    //     {/* Cloud-like glow layers */}
    //     <div
    //       className="absolute w-[140%] h-[70%] -top-[20%] -left-[20%] rounded-full blur-[120px] opacity-30 animate-[aurora-drift-1_25s_ease-in-out_infinite]"
    //       style={{ background: "radial-gradient(circle, rgba(129, 140, 248, 0.5) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)" }}
    //     />
    //     <div
    //       className="absolute w-[100%] h-[80%] bottom-[-30%] right-[-10%] rounded-full blur-[140px] opacity-25 animate-[aurora-drift-2_30s_ease-in-out_infinite]"
    //       style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)" }}
    //     />
    //     <div
    //       className="absolute w-[90%] h-[50%] top-[30%] left-[-5%] rounded-full blur-[100px] opacity-20 animate-[aurora-drift-3_22s_ease-in-out_infinite]"
    //       style={{ background: "radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 60%)" }}
    //     />
    //   </div>

    //   <div className="relative z-10 max-w-7xl mx-auto px-4">
    //   <TopMenu />
    <div className="relative min-h-screen">
    <Y2KStarfield />

    <div className="relative z-10 max-w-7xl mx-auto px-4">
      <TopMenu />
      
      {/* ---- Hero + Now Playing ---- */}
      <section className="py-20 md:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
          <div className="text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
            <div className="glow-chip mb-6 mx-auto lg:mx-0 w-fit">NOW PLAYING</div>
            <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              <h1 className="headline-chrome font-display text-4xl md:text-6xl lg:text-7xl leading-tight text-balance tracking-wider font-bold">
                discover. rate. annotate.
              </h1>
              <span className="hero-headline-star inline-flex shrink-0" aria-hidden>
                <Image src={star1} alt="" width={36} height={36} className="object-contain w-9 h-9" unoptimized />
              </span>
            </div>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl mx-auto lg:mx-0">
              Dive deep into your favorite tracks with ratings, reviews,
              line-by-line annotations, and community insights.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-10">
              <Link href="/search">
                <Button className="holo-gradient text-background font-semibold hover:opacity-90 px-8 py-2.5 btn-press neon-glow-cyan text-sm tracking-wide">
                  EXPLORE TRACKS
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/60 bg-transparent btn-press px-8 py-2.5 text-sm tracking-wide font-medium">
                  JOIN COMMUNITY
                </Button>
              </Link>
            </div>
          </div>

          {/* Now Playing widget with jukebox image + purple glow behind */}
          <div className="hero-now-playing-wrap relative flex justify-center lg:justify-end">
            <div className="hero-jukebox-glow" aria-hidden />
            <div className="hero-jukebox-bg" aria-hidden style={{width: "1090px", height: "1090px", transform: "translate(-460px, -300px) rotate(-20deg)"}}>
              <Image src={jukebox1} alt="" fill className="object-contain" unoptimized />
            </div>
            <div className="relative z-10 w-full max-w-none -ml-29 mt-10" style={{transform: "translate(-80px, 40px)"}}>
              <NowPlayingWidget tracks={nowPlayingTracks} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-10 md:gap-20 mt-16 text-center">
          {[
            { label: "TRACKS", value: total ?? 0, icon: Headphones },
            { label: "COMMUNITY", value: "OPEN", icon: Users },
            { label: "ANNOTATIONS", value: "LIVE", icon: MessageSquare },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5">
              <stat.icon className="h-5 w-5 text-primary mb-1" />
              <span className="text-xl font-display font-bold text-foreground tracking-wide">{String(stat.value)}</span>
              <span className="text-[10px] text-muted-foreground tracking-widest font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- What Is Jukebox / Why / How - Rave Panels ----
      <section className="pb-16">
        <SectionHeader
          label="THE VIBE"
          title="What Is Jukebox?"
          subtitle="Your all-in-one platform for meaningful music discussion"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feat) => {
            const colors = colorMap[feat.color];
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`glass rounded-xl p-6 border ${colors.border} ${colors.glow} ${colors.hoverGlow} transition-all duration-500 card-tilt group cursor-default`}
              >
                <div className={`h-12 w-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-6 w-6 ${colors.iconColor}`} />
                </div>
                <h3 className="font-display text-sm font-semibold text-foreground tracking-wide mb-2">
                  {feat.title.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
        </section> */}
        
        {/* ---- CD Case Carousel ---- */}
      <section className="pb-12">
        <SectionHeader
          label="HOW IT WORKS"
          title="Your Music, Deeply Explored"
          subtitle="Four ways Jukebox helps you connect with music"
        />
        <CdCaseCarousel />
      </section>

      {/* Groove divider */}
      <div className="groove-line mb-12" />

      {/* ---- For You ---- */}
      {forYouTracks.length > 0 && (
        <section className="pb-12">
          <SectionHeader
            label="FOR YOU"
            title="Picked For Your Taste"
            subtitle={`Based on your love of ${userGenrePrefs.slice(0, 3).join(", ")}`}
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {forYouTracks.map((track, i) => (
              <TrackCard
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                album={null}
                albumArtUrl={track.cover_url ?? null}
                genre={Array.isArray(track.tags) && track.tags[0] ? String(track.tags[0]) : null}
                averageRating={track.average_rating ?? 0}
                totalRatings={track.total_ratings ?? 0}
                rank={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      {forYouTracks.length > 0 && <div className="groove-line mb-12" />}

      {/* ---- Top Rated ---- */}
      <section className="pb-12">
        <SectionHeader
          label="TOP RATED"
          title="Community Favorites"
          subtitle="Highest rated tracks across the platform"
          action={
            <Link href="/search" className="text-sm text-primary flex items-center gap-1.5 hover:underline font-medium tracking-wide">
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topTracks?.map((track, i) => (
            <TrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              album={null}
              albumArtUrl={track.cover_url ?? null}
              genre={Array.isArray(track.tags) && track.tags[0] ? String(track.tags[0]) : null}
              averageRating={track.average_rating ?? 0}
              totalRatings={track.total_ratings ?? 0}
              rank={i + 1}
            />
          ))}
        </div>
      </section>

      {/* Groove divider */}
      <div className="groove-line mb-12" />

      {/* ---- Trending ---- */}
      <section className="pb-12">
        <SectionHeader
          label="TRENDING"
          title="Hot Discussions"
          subtitle="Most active tracks this week"
        />
        <div className="grid gap-3 md:grid-cols-2">
          {trendingTracks?.map((track) => (
            <TrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              album={null}
              albumArtUrl={track.cover_url ?? null}
              genre={Array.isArray(track.tags) && track.tags[0] ? String(track.tags[0]) : null}
              averageRating={track.average_rating ?? 0}
              totalRatings={track.total_ratings ?? 0}
            />
          ))}
        </div>
      </section>

      {/* Groove divider */}
      <div className="groove-line mb-12" />

      {/* ---- Browse tracks (paginated) ----
      <section className="pb-12">
        <SectionHeader
          label="BROWSE"
          title="BROWSE TRACKS"
          subtitle={`${total} tracks · page ${page} of ${totalPages}`}
          action={
            <Link href="/search" className="text-sm text-primary flex items-center gap-1.5 hover:underline font-medium tracking-wide">
              SEARCH <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="mb-8">
          <BrowseTracksCarousel tracks={browseTracks} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {browseTracks?.map((track) => (
            <TrackCard
              key={track.id}
              id={track.id}
              title={track.title}
              artist={track.artist}
              album={null}
              albumArtUrl={track.cover_url ?? null}
              genre={Array.isArray(track.tags) && track.tags[0] ? String(track.tags[0]) : null}
              averageRating={track.average_rating ?? 0}
              totalRatings={track.total_ratings ?? 0}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-8">
          {hasPrev ? (
            <Link href={page === 2 ? "/" : `/?page=${page - 1}`}>
              <Button variant="outline" size="sm" className="gap-1.5 border-border/50 text-foreground hover:bg-secondary/60">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-50">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {totalPages}
          </span>
          {hasNext ? (
            <Link href={`/?page=${page + 1}`}>
              <Button variant="outline" size="sm" className="gap-1.5 border-border/50 text-foreground hover:bg-secondary/60">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-50">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section> */}

      {/* Groove divider */}
      <div className="groove-line mb-12" />


      {/* Groove divider */}
      <div className="groove-line mb-12" />

      {/* ---- Featured Playlists ---- */}
      <section className="pb-20">
        <SectionHeader
          label="PLAYLISTS"
          title="Featured Collections"
          subtitle="Curated collections from the community"
          action={
            <Link href="/playlists" className="text-sm text-primary flex items-center gap-1.5 hover:underline font-medium tracking-wide">
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {playlists && playlists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {playlists.map((pl) => (
              <Link key={pl.id} href={`/playlists/${pl.id}`}>
                <div className="glass rounded-xl p-5 border border-border/30 transition-all duration-500 cursor-pointer h-full card-tilt hover:border-primary/20 hover:shadow-[0_0_20px_rgba(91,234,214,0.08)]">
                  <div className="h-24 w-full rounded-lg holo-gradient opacity-15 mb-4" />
                  <h3 className="font-display text-sm font-semibold text-foreground tracking-wide truncate">
                    {pl.title?.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {pl.description || "A curated playlist"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-10 text-center border border-border/30">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Layers className="h-7 w-7 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">No playlists yet. Be the first to create one!</p>
            <Link href="/playlists/new" className="inline-block">
              <Button size="sm" className="holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan">
                CREATE PLAYLIST
              </Button>
            </Link>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}