import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RegisterSchema = z
  .object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"],
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

  const onSubmit = (data: RegisterSchema) => {
    console.log("Register", data);
  };

  return (
    <div className="h-full p-6">
      <div className="w-full mx-auto">
        <Link to="/" className="block dark:text-white text-4xl text-center">
          Sewaddle
        </Link>
        <div className="h-6" />
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col">
            <label className="dark:text-white" htmlFor="username">
              Username
            </label>
            <input id="username" type="text" {...register("username")} />
            {errors.username && (
              <p className="dark:text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="dark:text-white" htmlFor="email">
              Email
            </label>
            <input id="email" type="text" {...register("email")} />
            {errors.email && (
              <p className="dark:text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="dark:text-white" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="dark:text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label className="dark:text-white" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="dark:text-red-500">
                {errors.confirmPassword.message}
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
