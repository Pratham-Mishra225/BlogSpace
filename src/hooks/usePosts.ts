import { useCallback, useEffect, useState } from "react";
import type { Post } from "@/types";
import { getFollowingPosts, getPostById, getPosts } from "@/services/api";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function usePosts(mode: "explore" | "following" = "explore") {
  const [state, setState] = useState<State<Post[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = mode === "following" ? await getFollowingPosts() : await getPosts();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: (e as Error).message });
    }
  }, [mode]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refetch: load };
}

export function usePost(id: string) {
  const [state, setState] = useState<State<Post>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await getPostById(id);
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({ data: null, loading: false, error: (e as Error).message });
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refetch: load };
}
