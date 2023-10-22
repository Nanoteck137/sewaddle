import Input from "@/components/Input";
import Button from "@/components/ui/Button";
import { trpc } from "@/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

const SetupSchema = z
  .object({
    username: z.string().min(1),
    password: z.string().min(8),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Password don't match",
    path: ["passwordConfirm"],
  });
type SetupSchema = z.infer<typeof SetupSchema>;

const SetupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupSchema>({
    resolver: zodResolver(SetupSchema),
  });

  const navigate = useNavigate();
  const needSetup = trpc.setup.needed.useQuery();

  useEffect(() => {
    if (needSetup.data !== undefined && !needSetup.data) {
      navigate("/");
    }
  }, [needSetup.data]);

  const runSetup = trpc.setup.run.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  const onSubmit = async (data: SetupSchema) => {
    console.log("Setup", data);
    runSetup.mutate(data);
  };

  return (
    <div className="flex h-full w-full md:items-center">
      <div className="flex flex-col gap-4 w-full p-6 md:mx-auto md:max-w-lg md:rounded md:border-2 md:border-gray-500">
        <div className="flex flex-col gap-1">
          <h1 className="block text-center font-bold text-3xl">Setup</h1>
          <h1 className="block text-center text-1xl">Create admin account</h1>
        </div>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="Username"
            error={errors.username?.message}
            autoComplete="username"
            {...register("username")}
          />
          <Input
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            autoComplete="new-password"
            {...register("password")}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            error={errors.passwordConfirm?.message}
            autoComplete="new-password"
            {...register("passwordConfirm")}
          />

          <Button type="submit" variant={"primary"}>
            Finish Setup
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
