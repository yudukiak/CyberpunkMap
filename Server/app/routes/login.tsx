import type { Route } from "./+types/login";
import { redirect } from "react-router";
import { LOGIN_PARAM } from "~/config";
import { createClient } from "~/lib/supabase";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "~/components/auth/auth-card";
import {
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/auth/auth-form";
import * as v from "valibot";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

// valibotスキーマ
const formSchema = v.object({
  email: v.pipe(v.string(), v.email("メールアドレスの形式で入力してください")),
  password: v.pipe(v.string(), v.minLength(8, "8文字以上で入力してください")),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const dataFields = Object.fromEntries(formData.entries());
  const result = v.safeParse(formSchema, dataFields);
  if (!result.success) {
    return {
      success: false,
      errors: { email: "メールアドレスまたはパスワードが間違っています" },
    };
  }
  const { supabase, headers } = createClient(request, "public");
  const { error } = await supabase.auth.signInWithPassword({
    email: result.output.email,
    password: result.output.password,
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
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (key !== LOGIN_PARAM) return redirect("/");
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="w-full space-y-4" method="post">
          <FormItem>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full"
            />
            <FormMessage>{errors?.email}</FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="w-full"
            />
          </FormItem>
          <Button type="submit" className="mt-4 w-full">
            Continue with Email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
