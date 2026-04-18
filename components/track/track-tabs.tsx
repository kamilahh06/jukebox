"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewsSection } from "./reviews-section";
import { LyricsSection } from "./lyrics-section";
import { ContextSection } from "./context-section";
import { MessageSquare, AlignLeft, Search } from "lucide-react";

interface TrackTabsProps {
  track: { id: string; title: string; artist: string };
  trackLines: Array<{ id: string; line_index: number; line_number: number; content: string }>;
  reviews: Array<Record<string, unknown>>;
  reviewUpvoteCounts?: Record<string, number>;
  annotations: Array<Record<string, unknown>>;
  annotationReactionCounts?: Record<string, Record<string, number>>;
  userId: string | null;
}

export function TrackTabs({
  track,
  trackLines,
  reviews,
  reviewUpvoteCounts = {},
  annotations,
  annotationReactionCounts = {},
  userId,
}: TrackTabsProps) {
  return (
    <Tabs defaultValue="reviews" className="w-full">
      <TabsList className="glass border border-border/30 bg-transparent h-auto p-1.5 gap-1 rounded-xl">
        <TabsTrigger
          value="reviews"
          className="relative data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground gap-2 font-medium tracking-wide text-sm transition-all duration-300 rounded-lg px-4 py-2 data-[state=active]:shadow-none"
        >
          <MessageSquare className="h-4 w-4" />
          REVIEWS ({reviews.length})
          <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full holo-gradient scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left" />
        </TabsTrigger>
        <TabsTrigger
          value="lyrics"
          className="relative data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground gap-2 font-medium tracking-wide text-sm transition-all duration-300 rounded-lg px-4 py-2 data-[state=active]:shadow-none"
        >
          <AlignLeft className="h-4 w-4" />
          TRACK TEXT ({trackLines.length})
          <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full holo-gradient scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left" />
        </TabsTrigger>
        <TabsTrigger
          value="context"
          className="relative data-[state=active]:bg-transparent data-[state=active]:text-primary text-muted-foreground gap-2 font-medium tracking-wide text-sm transition-all duration-300 rounded-lg px-4 py-2 data-[state=active]:shadow-none"
        >
          <Search className="h-4 w-4" />
          CONTEXT
          <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full holo-gradient scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-300 origin-left" />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="mt-6 animate-slide-up">
        <ReviewsSection
          trackId={track.id}
          reviews={reviews}
          reviewUpvoteCounts={reviewUpvoteCounts}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="lyrics" className="mt-6 animate-slide-up">
        <LyricsSection
          track={track}
          trackLines={trackLines}
          annotations={annotations}
          annotationReactionCounts={annotationReactionCounts}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="context" className="mt-6 animate-slide-up">
        <ContextSection trackTitle={track.title} artistName={track.artist} />
      </TabsContent>
    </Tabs>
  );
}
