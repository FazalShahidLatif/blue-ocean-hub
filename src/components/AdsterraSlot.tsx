import { useEffect, useRef, useState } from "react";

interface AdsterraSlotProps {
  zone: "rectangle" | "skyscraper" | "leaderboard";
  containerId: string;
}

const ZONE_KEYS: Record<string, { key: string; width: number; height: number }> = {
  rectangle: { key: "18e900a72b10163fd02748af2dead7ab", width: 300, height: 250 },
  skyscraper: { key: "1a3486e574702c647fa882e16155e922", width: 160, height: 600 },
  leaderboard: { key: "347d90a7831c45b3945479858043a89c", width: 728, height: 90 },
};

const SCRIPT_URL = "https://ballisticcomainvitation.com/${key}/invoke.js";

export default function AdsterraSlot({ zone, containerId }: AdsterraSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [consented, setConsented] = useState(false);

  // Check consent from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdff-consent");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.advertising) setConsented(true);
      }
    } catch {
      // No consent stored
    }

    // Listen for consent changes
    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.advertising) setConsented(true);
    };
    window.addEventListener("pdff:consent", handler);
    return () => window.removeEventListener("pdff:consent", handler);
  }, []);

  // Lazy-load when near viewport
  useEffect(() => {
    if (!slotRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(slotRef.current);
    return () => observer.disconnect();
  }, []);

  const zoneConfig = ZONE_KEYS[zone];
  if (!zoneConfig) return null;

  const snippet = `
    <script>
      atOptions = {
        'key': '${zoneConfig.key}',
        'format': 'iframe',
        'height': ${zoneConfig.height},
        'width': ${zoneConfig.width},
        'params': {}
      };
    </script>
    <script src="${SCRIPT_URL.replace("${key}", zoneConfig.key)}"></script>
  `;

  return (
    <div
      ref={slotRef}
      id={containerId}
      className="ad-slot"
      style={{
        width: zoneConfig.width,
        height: zoneConfig.height,
        margin: "0 auto",
        background: "transparent",
      }}
      aria-hidden="true"
    >
      {visible && consented && (
        <iframe
          title={`Adsterra ${zone} ad`}
          srcDoc={snippet}
          style={{
            width: zoneConfig.width,
            height: zoneConfig.height,
            border: "none",
            overflow: "hidden",
          }}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      )}
    </div>
  );
}
