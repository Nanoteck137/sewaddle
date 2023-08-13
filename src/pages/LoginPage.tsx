import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
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

  const onSubmit = (data: LoginSchema) => {
    console.log("Login", data);
  };

  return (
    <div className="h-full p-6">
      <div className="w-full mx-auto">
        <Link to="/" className="block dark:text-white text-4xl text-center">
          Sewaddle
        </Link>
        <div className="h-6" />
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <label className="dark:text-white" htmlFor="email">
            Email
          </label>
          <input id="email" type="text" {...register("email")} />
          {errors.email && (
            <p className="dark:text-red-500">{errors.email.message}</p>
          )}
          <label className="dark:text-white" htmlFor="password">
            Password
          </label>
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
