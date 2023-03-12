import { motion, AnimatePresence } from "framer-motion";
import { STATE } from "@/pages";

type HeaderProps = {
  title: string;
  description: string;
  state: STATE;
};
const VISIBLE_STATES: STATE[] = [
  "checkingPermissions",
  "requestingPermissions",
  "isDeniedPermissions",
  "initial",
];
export function Header({ title, state, description }: HeaderProps) {
  if (VISIBLE_STATES.includes(state)) {
    return (
      <AnimatePresence>
        <motion.header
          key="header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl text-gray-900 font-bold whitespace-pre-line leading-hero">
            {title}
          </h1>
          <div className="text-2xl mt-4 mb-16">{description}</div>
        </motion.header>
      </AnimatePresence>
    );
  }
  return null;
}
