import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";

import Input from "../components/Input";
import { useAuth } from "../contexts/AuthContext";

const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(1),
    newPasswordConfirm: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
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
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          autoComplete="new-password"
          error={errors.newPasswordConfirm?.message}
          {...register("newPasswordConfirm")}
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
    <div className="mx-auto w-full py-10 md:max-w-xl">
      <div className="flex flex-col gap-7 p-2">
        <p className="text-xl">Username: {auth.user?.username}</p>
        <ChangePassword />
      </div>
    </div>
  );
};

export default AccountPage;
