// import { createClient } from "@/lib/supabase/server";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { ListMusic, Plus, User, Layers } from "lucide-react";

// export default async function PlaylistsPage() {
//   const supabase = await createClient();

//   const { data: playlists } = await supabase
//     .from("playlists")
//     .select("*, profiles(username, display_name), playlist_items(count)")
//     .eq("is_public", true)
//     .order("created_at", { ascending: false });

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="flex items-end justify-between mb-8">
//         <div>
//           <span className="glow-chip mb-3 inline-block">PLAYLISTS</span>
//           <h1 className="font-display text-3xl text-foreground font-bold tracking-wider">
//             COLLECTIONS
//           </h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Community-curated track collections
//           </p>
//         </div>
//         {user && (
//           <Link href="/playlists/new">
//             <Button
//               size="sm"
//               className="holo-gradient text-background font-semibold hover:opacity-90 gap-1.5 btn-press neon-glow-cyan tracking-wide"
//             >
//               <Plus className="h-4 w-4" />
//               CREATE
//             </Button>
//           </Link>
//         )}
//       </div>

//       {!playlists || playlists.length === 0 ? (
//         <div className="glass rounded-xl p-12 text-center border border-border/30">
//           <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
//             <Layers className="h-8 w-8 text-primary" />
//           </div>
//           <h2 className="font-display text-lg text-foreground mb-2 tracking-wider font-semibold">NO PLAYLISTS YET</h2>
//           <p className="text-sm text-muted-foreground mb-4">
//             Be the first to create a curated collection!
//           </p>
//           {user && (
//             <Link href="/playlists/new">
//               <Button className="holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan">
//                 CREATE FIRST PLAYLIST
//               </Button>
//             </Link>
//           )}
//         </div>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {playlists.map((pl) => (
//             <Link key={pl.id} href={`/playlists/${pl.id}`}>
//               <div className="glass rounded-xl p-6 border border-border/30 transition-all duration-500 cursor-pointer h-full card-tilt hover:border-primary/20 hover:shadow-[0_0_20px_rgba(91,234,214,0.08)]">
//                 <div className="h-32 w-full rounded-lg holo-gradient opacity-12 mb-4" />
//                 <h3 className="font-display text-sm font-semibold text-foreground tracking-wider mb-1 truncate">
//                   {pl.title?.toUpperCase()}
//                 </h3>
//                 <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
//                   {pl.description || "A curated playlist"}
//                 </p>
//                 <div className="groove-line mb-3" />
//                 <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                   <div className="flex items-center gap-1">
//                     <User className="h-3 w-3" />
//                     {pl.profiles?.display_name || pl.profiles?.username || "Anonymous"}
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <ListMusic className="h-3 w-3" />
//                     {pl.playlist_items?.[0]?.count ?? 0} tracks
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListMusic, Plus, User, Layers } from "lucide-react";

export default async function PlaylistsPage() {
  const supabase = await createClient();

  const { data: playlists, error } = await supabase
    .from("playlists")
    .select("id, title, description, created_at, is_public, profiles(username, display_name)")
    .or("is_public.eq.true,is_public.is.null")
    .order("created_at", { ascending: false });

    if (error) {
      console.error("Playlists query error:", {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
    }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="glow-chip mb-3 inline-block">PLAYLISTS</span>
          <h1 className="font-display text-3xl text-foreground font-bold tracking-wider">
            COLLECTIONS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Community-curated track collections
          </p>
        </div>
        {user && (
          <Link href="/playlists/new">
            <Button size="sm" className="holo-gradient text-background font-semibold hover:opacity-90 gap-1.5 btn-press neon-glow-cyan tracking-wide">
              <Plus className="h-4 w-4" />
              CREATE
            </Button>
          </Link>
        )}
      </div>

      {!playlists || playlists.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-border/30">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-lg text-foreground mb-2 tracking-wider font-semibold">
            NO PLAYLISTS YET
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to create a curated collection!
          </p>
          {user && (
            <Link href="/playlists/new">
              <Button className="holo-gradient text-background font-semibold hover:opacity-90 btn-press neon-glow-cyan">
                CREATE FIRST PLAYLIST
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((pl) => (
            <Link key={pl.id} href={`/playlists/${pl.id}`}>
              <div className="glass rounded-xl p-6 border border-border/30 transition-all duration-500 cursor-pointer h-full card-tilt hover:border-primary/20 hover:shadow-[0_0_20px_rgba(91,234,214,0.08)]">
                <div className="h-32 w-full rounded-lg holo-gradient opacity-12 mb-4" />
                <h3 className="font-display text-sm font-semibold text-foreground tracking-wider mb-1 truncate">
                  {pl.title?.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {pl.description || "A curated playlist"}
                </p>
                <div className="groove-line mb-3" />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {pl.profiles?.display_name || pl.profiles?.username || "Anonymous"}
                  </div>
                  <div className="flex items-center gap-1">
                    <ListMusic className="h-3 w-3" />
                    {/* add counts later once base list works */}
                    —
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}