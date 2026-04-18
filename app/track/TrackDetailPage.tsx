"use client";

import { useState } from "react";
import { ContextTab } from "@/components/track/ContextTab";
import { Music, MessageSquare, Info, User } from "lucide-react";

interface TrackDetailPageProps {
  track: {
    id: string;
    title: string;
    artist: string;
    album?: string;
    cover_url?: string;
    duration?: number;
    release_date?: string;
  };
}

export default function TrackDetailPage({ track }: TrackDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lyrics" | "context" | "reviews">("context");

  const tabs = [
    { id: "overview", label: "Overview", icon: Music },
    { id: "lyrics", label: "Lyrics", icon: MessageSquare },
    { id: "context", label: "Context", icon: Info },
    { id: "reviews", label: "Reviews", icon: User },
  ] as const;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Track Header */}
        <div className="flex items-start gap-6 mb-8">
          {track.cover_url && (
            <div
              className="w-64 h-64 rounded-xl shrink-0"
              style={{
                backgroundImage: `url(${track.cover_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-2">{track.title}</h1>
            <h2 className="text-2xl text-purple-400 mb-4">{track.artist}</h2>
            {track.album && (
              <p className="text-white/60 mb-2">
                <span className="text-white/40">Album:</span> {track.album}
              </p>
            )}
            {track.release_date && (
              <p className="text-white/60 mb-2">
                <span className="text-white/40">Released:</span> {track.release_date}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 mb-8 p-1 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, rgba(20, 15, 35, 0.6), rgba(10, 8, 20, 0.8))',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(100, 70, 180, 0.15))'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 0 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : 'none',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div
          className="rounded-xl p-8"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 10, 30, 0.6), rgba(8, 5, 18, 0.8))',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          }}
        >
          {activeTab === "context" && (
            <ContextTab trackTitle={track.title} artistName={track.artist} />
          )}
          
          {activeTab === "overview" && (
            <div className="text-center py-12 text-white/60">
              Overview content would go here
            </div>
          )}
          
          {activeTab === "lyrics" && (
            <div className="text-center py-12 text-white/60">
              Lyrics with annotations would go here
            </div>
          )}
          
          {activeTab === "reviews" && (
            <div className="text-center py-12 text-white/60">
              Community reviews would go here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}