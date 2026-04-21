"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, X, GripVertical, Loader2, ListMusic } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
}

interface PlaylistItem {
  track: Track;
  note: string;
}

export default function NewPlaylistPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUserId(user.id);
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id, title, artist")
        .order("title");
      setAllTracks(tracks ?? []);
    };
    load();
  }, [router]);

  const filteredTracks = allTracks.filter(
    (t) =>
      !items.find((i) => i.track.id === t.id) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addTrack = (track: Track) => {
    setItems([...items, { track, note: "" }]);
    setSearchQuery("");
  };

  const removeTrack = (trackId: string) => {
    setItems(items.filter((i) => i.track.id !== trackId));
  };

  const updateNote = (trackId: string, note: string) => {
    setItems(items.map((i) => (i.track.id === trackId ? { ...i, note } : i)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();

    const { data: playlist, error: plError } = await supabase
      .from("playlists")
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
      })
      .select()
      .single();

    if (plError || !playlist) {
      toast.error("Failed to create playlist");
      setSubmitting(false);
      return;
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("playlist_items")
        .insert(
          items.map((item, i) => ({
            playlist_id: playlist.id,
            track_id: item.track.id,
            position: i,
            note: item.note.trim() || null,
          }))
        );
      if (itemsError) {
        // note column may not exist yet — retry without it
        const { error: retryError } = await supabase
          .from("playlist_items")
          .insert(
            items.map((item, i) => ({
              playlist_id: playlist.id,
              track_id: item.track.id,
              position: i,
            }))
          );
        if (retryError) {
          toast.error("Playlist created but failed to add tracks");
          setSubmitting(false);
          return;
        }
      }
    }

    toast.success("Playlist created!");
    router.push(`/playlists/${playlist.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="glow-chip">
          <ListMusic className="h-3 w-3" />
          New
        </span>
      </div>
      <h1 className="font-display text-3xl text-foreground mb-2 tracking-tight">Create Playlist</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Curate your collection with personal notes for each track
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title" className="text-foreground text-sm font-display tracking-wide">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Playlist"
                required
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground mt-1 focus:border-primary/40 focus:ring-primary/20"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-foreground text-sm font-display tracking-wide">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes this playlist special?"
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground mt-1 min-h-[100px] focus:border-primary/40 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Track selector */}
        <div className="glass rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px holo-gradient opacity-40" />
          <h3 className="text-sm font-display font-medium text-foreground mb-3 tracking-wide">Add Tracks</h3>
          <Input
            placeholder="Search tracks to add..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground mb-3 focus:border-primary/40 focus:ring-primary/20"
          />
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto rounded-lg bg-secondary/50 border border-border mb-4">
              {filteredTracks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">No matching tracks</p>
              ) : (
                filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => addTrack(track)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/5 transition-colors border-b border-border/30 last:border-0"
                  >
                    <Plus className="h-3 w-3 text-primary shrink-0" />
                    <div>
                      <span className="text-sm text-foreground">{track.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">{track.artist}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Selected tracks */}
          {items.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No tracks added yet. Search above to add tracks.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item, i) => (
                <div
                  key={item.track.id}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 border border-border/30"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-1 shrink-0" />
                  <span className="text-xs text-muted-foreground font-mono w-4 mt-1 shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {item.track.title}{" "}
                      <span className="text-muted-foreground">- {item.track.artist}</span>
                    </p>
                    <Input
                      placeholder="Why is this track here? (optional)"
                      value={item.note}
                      onChange={(e) => updateNote(item.track.id, e.target.value)}
                      className="bg-transparent border-border/30 text-foreground placeholder:text-muted-foreground/40 mt-1 h-7 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTrack(item.track.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 mt-1 btn-press"
                    aria-label="Remove track"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting || !title.trim()}
          className="holo-gradient text-background font-display font-medium hover:opacity-90 btn-press tracking-wide"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Playlist"
          )}
        </Button>
      </form>
    </div>
  );
}
