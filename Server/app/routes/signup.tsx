import type { Route } from "./+types/signup";
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
import Error from "~/components/error";
import * as v from "valibot";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function meta() {
  const title = ["Signup", "Cyberpunk RED Map"].filter(Boolean).join(" - ");
  return [
    { title },
  ];
}

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
    // フィールド名: メッセージ の形に変換
    const errorMap = Object.fromEntries(
      result.issues
        .map((issue) => {
          const key = issue.path?.[0]?.key;
          return key ? [key, issue.message] : null;
        })
        .filter(Boolean) as [string, string][]
    );
    return {
      success: false,
      errors: errorMap, // 例: { email: "xxx", password: "yyy" }
    };
  }

  const { supabase } = createClient(request, "public");
  await supabase.auth.signUp({
    email: result.output.email,
    password: result.output.password,
  });
  return {
    success: true,
    data: result.output,
  };
}

export default function SignupPage({ actionData }: Route.ComponentProps) {
  const errors = actionData?.errors ?? {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>アカウント登録</CardTitle>
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
              className="w-full"
            />
            <FormMessage>{errors.email}</FormMessage>
          </FormItem>
          <FormItem>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="w-full"
            />
            <FormMessage>{errors.password}</FormMessage>
          </FormItem>
          <Button type="submit" className="mt-4 w-full">
            アカウント登録する
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ErrorBoundary() {
  return <Error />;
}