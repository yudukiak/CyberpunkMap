import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "~/features/auth/components/auth-card";
import {
  FormItem,
  FormLabel,
  FormMessage,
} from "~/features/auth/components/auth-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

type AuthProps = {
  title: string;
  action: string;
  errors: {
    email?: string;
    password?: string;
  };
}

export default function Auth({ title, action, errors }: AuthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
            <FormMessage>{errors?.password}</FormMessage>
          </FormItem>
          <Button type="submit" className="mt-4 w-full">
            {action}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}