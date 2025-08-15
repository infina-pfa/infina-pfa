"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "agent-id"?: string;
          "dynamic-variables"?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ElevenLabsCallEvent extends Event {
  detail: {
    config: {
      clientTools?: {
        [key: string]: (params: { url?: string; [key: string]: unknown }) => void;
      };
    };
  };
}

export function ElevenLabsWidget() {
  const { user } = useAuthContext();
  const router = useRouter();
  const scriptLoaded = useRef(false);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    const initializeWidget = () => {
      if (widgetInitialized.current) return;

      // Wait for DOM to be ready
      setTimeout(() => {
        const widget = document.querySelector("elevenlabs-convai");
        
        if (widget) {
          // Add event listener for widget initialization
          widget.addEventListener("elevenlabs-convai:call", (event) => {
            const callEvent = event as ElevenLabsCallEvent;
            
            // Define client tools
            callEvent.detail.config.clientTools = {
              RedirectToExternalURL: (params: { url?: string; [key: string]: unknown }) => {
                const url = params.url;
                console.log("RedirectToExternalURL called with URL:", url);
                
                if (!url || typeof url !== "string") {
                  console.error("No URL provided to RedirectToExternalURL");
                  return;
                }

                // Parse the URL to determine if it's internal or external
                try {
                  const parsedUrl = new URL(url, window.location.origin);
                  const currentOrigin = window.location.origin;
                  
                  // Check if it's the same origin (internal navigation)
                  if (parsedUrl.origin === currentOrigin) {
                    // Extract pathname and search params for internal navigation
                    const internalPath = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                    console.log("Internal navigation to:", internalPath);
                    router.push(internalPath);
                  } else {
                    // Handle external URLs
                    console.log("External navigation to:", url);
                    window.open(url, "_blank", "noopener,noreferrer");
                  }
                } catch (error) {
                  // If URL parsing fails, try as internal path
                  if (url.startsWith("/")) {
                    console.log("Direct internal navigation to:", url);
                    router.push(url);
                  } else {
                    console.error("Invalid URL provided:", url, error);
                  }
                }
              },
            };
          });
          
          widgetInitialized.current = true;
          console.log("ElevenLabs widget initialized with client tools");
        }
      }, 100);
    };

    // Load the ElevenLabs script if not already loaded
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      
      script.onload = () => {
        scriptLoaded.current = true;
        // Initialize widget after script loads
        initializeWidget();
      };
      
      document.body.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      // If script already loaded, initialize widget
      initializeWidget();
    }
  }, [router]);

  // Prepare dynamic variables with user context
  const dynamicVariables = user
    ? JSON.stringify({
        user_id: user.id,
        user_email: user.email || "",
      })
    : undefined;

  return (
    <div style={{ position: "relative" }}>
      {React.createElement("elevenlabs-convai", {
        "agent-id": "agent_2301k2jes0nbe4zte8ycedhzh60a",
        "dynamic-variables": dynamicVariables,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)}
    </div>
  );
}