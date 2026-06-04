import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { followUser, unfollowUser } from "@/services/api";
import { toast } from "sonner";

interface Props {
  /** MongoDB ObjectId of the user to follow/unfollow */
  userId: string;
  /** Initial follow state — pass from the Profile API response's isFollowing field */
  initialFollowing?: boolean;
  onAuthRequired?: () => void;
}

export function FollowButton({ userId, initialFollowing = false, onAuthRequired }: Props) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState<boolean>(initialFollowing);
  const [pending, setPending] = useState(false);

  const handle = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    setPending(true);
    try {
      if (following) {
        const res = await unfollowUser(userId);
        setFollowing(res.following);
      } else {
        const res = await followUser(userId);
        setFollowing(res.following);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : "default"}
      size="sm"
      onClick={handle}
      disabled={pending}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
