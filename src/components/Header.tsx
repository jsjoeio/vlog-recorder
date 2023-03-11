import { STATE } from "@/pages";

type HeaderProps = {
  title: string;
  description: string;
  state: STATE;
};
export function Header({ title, state, description }: HeaderProps) {
  switch (state) {
    case "checkingPermissions":
    case "requestingPermissions":
    case "isDeniedPermissions":
    case "initial": {
      return (
        <header className="text-center">
          <h1 className="text-5xl text-gray-900 font-bold whitespace-pre-line leading-hero">
            {title}
          </h1>
          <div className="text-2xl mt-4 mb-16">{description}</div>
        </header>
      );
    }

    case "isConnectedWebcam":
    default: {
      return null;
    }
  }
}
