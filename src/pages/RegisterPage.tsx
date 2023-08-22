import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

const RegisterSchema = z
  .object({
    username: z.string().min(1),
    newPassword: z.string().min(8).max(72),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: "Password don't match",
    path: ["passwordConfirm"],
  });
type RegisterSchema = z.infer<typeof RegisterSchema>;

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(RegisterSchema),
  });

  const navigate = useNavigate();
  const auth = useAuth();

  if (auth.isLoggedIn) return <Navigate to="/" />;

  const onSubmit = async (data: RegisterSchema) => {
    auth.register(data).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="flex h-full w-full md:items-center">
      <div className="w-full p-6 md:mx-auto md:max-w-lg md:rounded md:border-2 md:border-gray-500 md:shadow">
        <Link to="/" className="block text-center text-4xl">
          Sewaddle
        </Link>
        <form
          className="mt-10 flex flex-col gap-8 md:mt-12"
          onSubmit={handleSubmit(onSubmit)}
        >
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
            error={errors.newPassword?.message}
            autoComplete="new-password"
            {...register("newPassword")}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            error={errors.passwordConfirm?.message}
            {...register("passwordConfirm")}
          />

          <button className="rounded bg-red-300 py-2" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
