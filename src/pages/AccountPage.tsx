import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    password: z.string().min(1),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Password don't match",
    path: ["passwordConfirm"],
  });
type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const auth = useAuth();

  const submit = (data: ChangePasswordSchema) => {
    console.log("Change password", data);
    auth.changePassword(data).then(() => {
      console.log("Password changed successfully");
      reset();
    });
  };

  return (
    <div>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
        <Input
          type="password"
          placeholder="Current Password"
          autoComplete="current-password"
          error={errors.oldPassword?.message}
          {...register("oldPassword")}
        />
        <Input
          type="password"
          placeholder="New Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          autoComplete="new-password"
          error={errors.passwordConfirm?.message}
          {...register("passwordConfirm")}
        />
        <button className="rounded bg-red-300 py-2" type="submit">
          Change Password
        </button>
      </form>
    </div>
  );
};

const AccountPage = () => {
  const auth = useAuth();

  if (!auth.isLoggedIn) return <Navigate to="/login" />;

  return (
    <div className="flex flex-col gap-6 p-2">
      <p>Account Page: {auth.user?.username}</p>
      <ChangePassword />
    </div>
  );
};

export default AccountPage;
