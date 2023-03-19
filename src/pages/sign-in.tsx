import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const SignInPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!(status === "loading") && !session) {
      const callbackUrl = `${window.location.origin}/callback`;
      signIn("google", {
        callbackUrl,
      });
    }
    if (session) {
      router.replace({
        pathname: "/",
        query: { signedIn: true },
      });
    }
  }, [session, status, router]);

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
    ></div>
  );
};

export default SignInPage;
