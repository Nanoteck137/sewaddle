import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            className="text-black"
            id="oldPassword"
            type="text"
            {...register("oldPassword")}
          />
          {errors.oldPassword && <p>{errors.oldPassword.message}</p>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">New Password</label>
          <input
            className="text-black"
            id="password"
            type="text"
            {...register("password")}
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <div className="flex flex-col">
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            className="text-black"
            id="passwordConfirm"
            type="text"
            {...register("passwordConfirm")}
          />
          {errors.passwordConfirm && <p>{errors.passwordConfirm.message}</p>}
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

const AccountPage = () => {
  const auth = useAuth();

  if (!auth.isLoggedIn) return <Navigate to="/login" />;
  if (!auth.user) return <p></p>;

  return (
    <div>
      <p>Account Page: {auth.user.username}</p>
      <ChangePassword />
    </div>
  );
};

export default AccountPage;
