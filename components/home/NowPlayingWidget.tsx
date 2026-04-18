import Link from "next/link";

export type NowPlayingTrack = {
  id?: string;
  title: string;
  artist: string;
  coverUrl?: string | null;
  /** 0–100, shown as "% liked" or meter */
  percentLiked?: number;
};

// TODO: Wire real tracks from homepage topTracks query (map cover_url, average_rating → percentLiked).
const PLACEHOLDER_TRACKS: NowPlayingTrack[] = [
  { title: "Midnight Drive", artist: "Neon Pulse", percentLiked: 92 },
  { title: "Starlight", artist: "Cosmic Echo", percentLiked: 88 },
  { title: "Digital Dreams", artist: "Synth Wave", percentLiked: 76 },
  { title: "Retro Future", artist: "Y2K Collective", percentLiked: 94 },
];

function formatPercent(value: number | undefined): string {
  if (value == null || value < 0) return "—";
  const n = Math.min(100, Math.round(value));
  return `${n}%`;
}

export function NowPlayingWidget({ tracks }: { tracks?: NowPlayingTrack[] | null }) {
  const rows = (tracks && tracks.length > 0 ? tracks.slice(0, 4) : PLACEHOLDER_TRACKS).slice(0, 4);

  return (
    <div className="now-playing-widget y2k-widget-frame">
      <div className="now-playing-widget-scanlines" aria-hidden />
      <div className="now-playing-widget-inner">
        <div className="now-playing-widget-label">NOW PLAYING</div>
        <ul className="now-playing-widget-rows">
          {rows.map((track, i) => {
            const rowContent = (
              <>
                <div className="now-playing-widget-cover">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="now-playing-widget-cover-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="now-playing-widget-cover-placeholder" />
                  )}
                </div>
                <div className="now-playing-widget-info min-w-0 flex-1">
                  <span className="now-playing-widget-title truncate block">{track.title}</span>
                  <span className="now-playing-widget-artist truncate block">{track.artist}</span>
                </div>
                <div className="now-playing-widget-meter shrink-0 font-mono text-[10px] text-[rgba(185,128,255,0.9)] tabular-nums">
                  {formatPercent(track.percentLiked)} liked
                </div>
              </>
            );
            return (
              <li key={track.id ?? i}>
                {track.id ? (
                  <Link href={`/track/${track.id}`} className="now-playing-widget-row">
                    {rowContent}
                  </Link>
                ) : (
                  <div className="now-playing-widget-row" role="presentation">
                    {rowContent}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
