import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";

import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string(), //.min(8).max(72),
});
type LoginSchema = z.infer<typeof LoginSchema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
  });

  const navigate = useNavigate();
  const auth = useAuth();

  if (auth.isLoggedIn) return <Navigate to="/" />;

  const onSubmit = (data: LoginSchema) => {
    auth.login(data).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="flex h-full w-full md:items-center">
      <div className="w-full p-6 md:mx-auto md:max-w-lg md:rounded md:border-2 md:border-gray-500">
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
            error={errors.password?.message}
            autoComplete="current-password"
            {...register("password")}
          />

          <button className="rounded bg-red-300 py-2" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
