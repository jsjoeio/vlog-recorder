import { clientEnv } from "@/clientEnv";

const featureFlags = {
  "use-api-url": clientEnv.success
    ? clientEnv.data.NEXT_PUBLIC_USE_API_URL
    : false,
};

export async function callIfApiEnabled(
  callback: any
): Promise<any> {
  const STUB_API_RESPONSE = 2000;
  if (featureFlags["use-api-url"]) {
    return callback();
  } else {
    return new Promise((resolve) => setTimeout(resolve, STUB_API_RESPONSE));
  }
}
