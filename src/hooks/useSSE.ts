import { useEffect } from "react";

export const useSSE = <T = unknown>(
  url: string,
  onMessage: (data: T) => void,
) => {
  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log("🟢 SSE Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("❌ Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("❌ SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log("🔴 SSE Disconnected");
    };
  }, [url, onMessage]);
};
