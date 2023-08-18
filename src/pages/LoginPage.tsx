import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "../contexts/authContext";

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
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

  const onSubmit = (data: LoginSchema) => {
    auth.login(data).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="h-full p-6">
      {auth.isLoggedIn && <Navigate to="/" />}
      <div className="mx-auto w-full">
        <Link to="/" className="block text-center text-4xl">
          Sewaddle
        </Link>
        <div className="h-6" />
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" {...register("username")} />
          {errors.username && (
            <p className="dark:text-red-500">{errors.username.message}</p>
          )}
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="dark:text-red-500">{errors.password.message}</p>
          )}
          <div className="h-6" />
          <button className="bg-gray-300" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
