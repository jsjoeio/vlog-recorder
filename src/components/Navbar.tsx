import { STATE } from "@/pages";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

type NavbarProps = {
  state: STATE;
};

export function Navbar({ state }: NavbarProps) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;

  if (state === "isDoneProcessingVideo" && status === "authenticated") {
    return (
      <AnimatePresence>
        <motion.nav
          key="navbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-right pt-6 pr-10"
        >
          <ul>
            <li className="text-sm">{userEmail}</li>
            <li className="text-sm" onClick={async () => await signOut()}>
              <button>Log out</button>
            </li>
          </ul>
        </motion.nav>
      </AnimatePresence>
    );
  }

  return <div style={{ height: "64px" }} />;
}
