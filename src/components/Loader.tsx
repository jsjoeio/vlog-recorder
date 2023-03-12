import { motion } from "framer-motion";
type LoaderProps = {
  text?: string;
  isHero: boolean;
};
export function Loader({ text, isHero = false }: LoaderProps) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${isHero ? "hero min-h-screen bg-base-200" : ""}`}
    >
      <div className="hero-content text-center mb-12">
        <div className="max-w-md">
          {text ? (
            <span className="text-3xl font-semibold whitespace-pre-line mb-8 block">
              {text}
            </span>
          ) : null}
          <progress className="progress h-10 w-96"></progress>
        </div>
      </div>
    </motion.div>
  );
}
