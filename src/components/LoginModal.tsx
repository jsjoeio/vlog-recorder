import { useSession, signIn, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LoaderButton } from "./LoaderButton";

export function popUpCenter(url: string, title: string) {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;

  const width =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

  const height =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;

  const systemZoom = width / window.screen.availWidth;

  const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
  const top = (height - 550) / 2 / systemZoom + dualScreenTop;

  const newWindow = window.open(
    url,
    title,
    `width=${500 / systemZoom},height=${
      550 / systemZoom
    },top=${top},left=${left}`
  );

  newWindow?.focus();
}

export function LoginModal() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <motion.button
        key="login-to-youtube"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        exit={{ opacity: 0 }}
        className="btn btn-outline btn-accent gap-2 mx-auto normal-case text-center block"
        onClick={() =>
          popUpCenter("/sign-in", "Vlog Recorder -Login to YouTube")
        }
      >
        Login to publish to YouTube
      </motion.button>
    );
  }

  return null;
}
