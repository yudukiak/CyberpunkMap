import type { Route } from "./+types/login";
import { redirect } from "react-router";

import { createClient } from "~/lib/supabase";
import { parseAuthFormData } from "~/features/auth/utils/auth-schema";
import { checkAuthKey } from "~/features/auth/utils/auth-loader";
import Auth from "~/features/auth/components/auth";
import Error from "~/components/error";

export function meta() {
  const title = ["Login", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [{ title }];
}

export async function action({ request }: Route.ActionArgs) {
  const result = await parseAuthFormData(request);
  if (!result.success) {
    return {
      success: false,
      errors: { email: "メールアドレスまたはパスワードが間違っています" },
    };
  }

  const { supabase, headers } = createClient(request, "public");
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return {
      success: false,
      errors: { email: "メールアドレスまたはパスワードが間違っています" },
    };
  }

  return redirect("/edit", { headers });
}

export async function loader({ request }: Route.LoaderArgs) {
  await checkAuthKey(request);
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors ?? {};
  return <Auth title="Log in" action="Continue with Email" errors={errors} />;
}

export function ErrorBoundary() {
  return <Error />;
}
