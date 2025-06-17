import * as v from "valibot";

export const authSchema = v.object({
  email: v.pipe(v.string(), v.email("メールアドレスの形式で入力してください")),
  password: v.pipe(v.string(), v.minLength(8, "8文字以上で入力してください")),
});

export type AuthSchemaType = v.InferOutput<typeof authSchema>;

export type AuthFormData = {
  email: string;
  password: string;
};

export async function parseAuthFormData(request: Request) {
  const formData = await request.formData();
  const dataFields = Object.fromEntries(formData.entries());
  const result = v.safeParse(authSchema, dataFields);
  
  if (!result.success) {
    const issues = v.flatten(result.issues);
    const errorEmail = issues.nested?.email?.[0];
    const errorPassword = issues.nested?.password?.[0];
    return {
      success: false as const,
      errors: {
        ...(errorEmail && { email: errorEmail }),
        ...(errorPassword && { password: errorPassword }),
      },
    };
  }

  return {
    success: true as const,
    data: result.output,
  };
}