import { useState, useEffect } from "react";

type Org = {
  id: string;
  name: string;
  role: string | null;
};

export function useCurrentOrg() {
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentOrg = async () => {
      try {
        const res = await fetch("/api/orgs/current");
        const json = await res.json();
        if (res.ok && json.org?.[0]) {
          setCurrentOrg({
            id: json.org[0].org_id,
            name: json.org[0].org_name,
            role: json.org[0].role,
          });
        }
      } catch (e) {
        console.error("Failed to fetch current org:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentOrg();
  }, []);

  return { currentOrg, loading };
}

