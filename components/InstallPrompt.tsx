"use client";

import c from "js-cookie";
import { useEffect, useRef, useState } from "react";

export const InstallPrompt: React.FC = (): React.JSX.Element | null => {
  const ref = useRef<HTMLDialogElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | undefined>(
    undefined,
  );
  const installCookie = "install2ed1993";
  const installStatus = c.get(installCookie);

  useEffect(() => {
    const showInstallPrompt = (): boolean => {
      if (
        // @ts-ignore
        window.navigator.standalone ||
        window.matchMedia("(display-mode: standalone)").matches ||
        installStatus !== undefined
      ) {
        return false;
      }

      return true;
    };

    if (showInstallPrompt()) {
      window.addEventListener("beforeinstallprompt", (event: Event) => {
        event.preventDefault();
        setDeferredPrompt(event);
      });

      window.addEventListener("appinstalled", () => {
        c.set(installCookie, "installed");
      });

      ref.current?.showPopover();
    }
  }, []);

  return (
    <dialog
      id="install-prompt"
      ref={ref}
      popover="manual"
      className="fixed inset-x-0 top-0 w-full p-4 bg-2ed-light-blue shadow-lg"
    >
      <div className="flex flex-col gap-2 p-4 border-4 border-black">
        <h3 className="font-title text-xl">Install 2ed1993</h3>
        <p className="text-lg">
          2ed1993 runs from your browser, but you can save it like an app for
          quick access.
        </p>
        {deferredPrompt ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                c.set(installCookie, "dismissed");
                ref.current?.hidePopover();
              }}
              className="px-4 py-1 rounded-none bg-tranparent border-4 border-black outline-0 font-subtitle shadow-lg"
            >
              <span className="text-xl">&#9746;</span> No, thank you
            </button>
            <button
              onClick={async () => {
                // @ts-ignore
                deferredPrompt.prompt();
                // @ts-ignore
                const { outcome } = await deferredPrompt.userChoice;
                c.set(installCookie, outcome);
                setDeferredPrompt(undefined);
                ref.current?.hidePopover();
              }}
              className="px-4 py-1 rounded-none bg-2ed-black border-4 border-black outline-0 font-subtitle text-white shadow-lg"
            >
              <span className="text-xl">&#9745;</span> Install 2ed1993
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border-4 border-black">
                <h4 className="font-subtitle text-xl">iOS</h4>
                <p className="text-lg">In Safari:</p>
                <div className="ordered-list text-lg">
                  <ol>
                    <li>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="inline size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                      </svg>{" "}
                      Menu
                    </li>
                    <li>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="inline size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                        />
                      </svg>{" "}
                      Share
                    </li>
                    <li>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="inline size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>{" "}
                      Add to Home Screen
                    </li>
                  </ol>
                </div>
              </div>
              <div className="p-4 border-4 border-black">
                <h4 className="font-subtitle text-xl">Android</h4>
                <p className="text-lg">In browser:</p>
                <div className="ordered-list text-lg">
                  <ol>
                    <li>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="inline size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                      </svg>{" "}
                      Menu
                    </li>
                    <li>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="inline size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>{" "}
                      Add to Home Screen
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  c.set(installCookie, "dismissed");
                  ref.current?.hidePopover();
                }}
                className="px-4 py-1 rounded-none bg-tranparent border-4 border-black outline-0 font-subtitle shadow-lg"
              >
                <span className="text-xl">&#9746;</span> No, thank you
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};
