import type { Route } from "./+types/signup";
import { redirect } from "react-router";

import { createClient } from "~/lib/supabase";
import { parseAuthFormData } from "~/features/auth/utils/auth-schema";
import { checkAuthKey } from "~/features/auth/utils/auth-loader";
import Auth from "~/features/auth/components/auth";
import Error from "~/components/error";

export function meta() {
  const title = ["Signup", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [{ title }];
}

export async function action({ request }: Route.ActionArgs) {
  const result = await parseAuthFormData(request);
  if (!result.success) {
    return {
      success: false,
      errors: result.errors,
    };
  }

  const { supabase, headers } = createClient(request, "public");
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return {
      success: false,
      errors: { email: "メールアドレスがすでに使用されています" },
    };
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  return redirect(`/login?key=${key}`, { headers });
}

export async function loader({ request }: Route.LoaderArgs) {
  await checkAuthKey(request);
}

export default function SignupPage({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors ?? {};
  return <Auth title="Sign up" action="Sign up" errors={errors} />;
}

export function ErrorBoundary() {
  return <Error />;
}
