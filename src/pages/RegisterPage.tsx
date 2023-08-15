import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuth } from "../hooks/useAuth";

const RegisterSchema = z
  .object({
    username: z.string().min(1),
    password: z.string().min(1),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
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

  const onSubmit = async (data: RegisterSchema) => {
    auth.register(data).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="h-full p-6">
      {auth.user && <Navigate to="/" />}

      <div className="mx-auto w-full">
        <Link to="/" className="block text-center text-4xl">
          Sewaddle
        </Link>
        <div className="h-6" />
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" {...register("username")} />
            {errors.username && (
              <p className="dark:text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="dark:text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              id="passwordConfirm"
              type="password"
              {...register("passwordConfirm")}
            />
            {errors.passwordConfirm && (
              <p className="dark:text-red-500">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>
          <div className="h-6" />
          <button className="bg-gray-300" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
