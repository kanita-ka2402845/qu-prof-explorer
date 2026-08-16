"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { getFullProfile, getUserReviews, getLikedReviews } from "@/lib/queries";
import type { ProfileFull } from "@/lib/queries";
import ProfileHero from "@/components/profile/ProfileHero";
import ReviewTabs from "@/components/profile/ReviewTabs";
import AwardsModal from "@/components/profile/AwardsModal";
import LeaderboardModal from "@/components/profile/LeaderboardModal";

export default function ProfilePage() {
  const { session } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileFull | null>(null);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [likedReviews, setLikedReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardsOpen, setAwardsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  useEffect(() => {
    if (!session) { router.push("/"); return; }

    const userId = session.user.id;
    Promise.all([
      getFullProfile(userId),
      getUserReviews(userId),
      getLikedReviews(userId),
    ]).then(([prof, mine, liked]) => {
      setProfile(prof);
      setMyReviews(mine);
      setLikedReviews(liked);
      setLoading(false);
    });
  }, [session]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--void)" }}>
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--hair) var(--hair) var(--hair) transparent" }} />
    </div>
  );

  if (!profile) return null;

  return (
    <main className="min-h-screen pb-24" style={{ background: "var(--void)" }}>
      <div className="mx-auto max-w-2xl px-4 pt-10 space-y-6">
        <ProfileHero
          profile={profile}
          onProfileUpdate={(updated) => setProfile((p) => p ? { ...p, ...updated } : p)}
          onAwardsClick={() => setAwardsOpen(true)}
          onLeaderboardClick={() => setLeaderboardOpen(true)}
        />
        <ReviewTabs myReviews={myReviews} likedReviews={likedReviews} />
      </div>

      <AwardsModal
        open={awardsOpen}
        onClose={() => setAwardsOpen(false)}
        earnedBadges={profile.badges}
      />
      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentUserId={session!.user.id}
        showOnLeaderboard={profile.show_on_leaderboard}
        onToggle={(val) => setProfile((p) => p ? { ...p, show_on_leaderboard: val } : p)}
      />
    </main>
  );
}