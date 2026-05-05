import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isFollowing as checkFollowing, toggleFollow } from "@/services/api";
import { toast } from "sonner";

interface Props {
  userId: string;
  onAuthRequired?: () => void;
}

export function FollowButton({ userId, onAuthRequired }: Props) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState<boolean>(() => checkFollowing(userId));
  const [pending, setPending] = useState(false);

  const handle = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    setPending(true);
    try {
      const res = await toggleFollow(userId);
      setFollowing(res.following);
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
