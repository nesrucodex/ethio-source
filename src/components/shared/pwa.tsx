"use client";
import { useEffect, useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "./states";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          /* Browsing remains available if installation is unsupported. */
        });
    }
  }, []);
  return null;
}
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const update = () => setInstalled(media.matches);
    update();
    media.addEventListener("change", update);
    const available = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const done = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", done);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  return (
    <div className="flex flex-col gap-6">
      <Notice
        title={
          installed
            ? "You’re using the installed app"
            : "Your next good find, one tap away"
        }
      >
        Add EthioSource to your home screen. It uses the same secure account and
        stays up to date with the web store.
      </Notice>
      {installed ? (
        <p className="flex items-center gap-2 text-primary">
          <Check size={18} />
          EthioSource is installed.
        </p>
      ) : (
        <>
          {prompt ? (
            <Button
              size="lg"
              className="self-start"
              onClick={async () => {
                try {
                  await prompt.prompt();
                  const choice = await prompt.userChoice;
                  setPrompt(null);
                  if (choice.outcome === "accepted") setInstalled(true);
                } catch {
                  setMessage("Use your browser’s menu to install this app.");
                }
              }}
            >
              <Download data-icon="inline-start" />
              Install EthioSource
            </Button>
          ) : null}
          <h2>On iPhone or iPad</h2>
          <p>
            Open this website in Safari, tap Share, then choose{" "}
            <strong>Add to Home Screen</strong>.
          </p>
          <h2>On Android</h2>
          <p>
            Open this website in Chrome. Choose <strong>Install app</strong> or{" "}
            <strong>Add to Home screen</strong> from the browser menu.
          </p>
          <h2>On your computer</h2>
          <p>
            In a supported browser, use the install icon in the address bar or
            the browser’s app menu.
          </p>
        </>
      )}
      {message ? <p role="status">{message}</p> : null}
      <p>
        Shopping, payments, and order updates need an internet connection. If
        you open the app offline, you’ll see a reconnect screen. Your shopping
        bag stays saved on your device.
      </p>
    </div>
  );
}
