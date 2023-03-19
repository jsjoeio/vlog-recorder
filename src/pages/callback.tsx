import { useSession } from "next-auth/react";
import { useEffect } from "react";

const CallbackPage = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!(status === "loading") && session) {
      window.opener.close();
    }
  }, [session, status]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        left: 0,
        top: 0,
        background: "white",
      }}
    >
      Success! You can close this page.
    </div>
  );
};

export default CallbackPage;
