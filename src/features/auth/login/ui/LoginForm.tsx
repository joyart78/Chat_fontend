import { useState } from "react";
import type { FormEvent } from "react";
import { Input, Button } from "@/shared/ui";
import {
  type LoginData,
  type LoginErrors,
  validateLogin,
  isValidLogin,
} from "@/entities/authLogin";
import { useLoginMutation } from "@/entities/authLogin/api/loginApi";
import styles from "./LoginForm.module.css";

export const LoginForm = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [login, { isLoading }] = useLoginMutation();

  const handleChange =
    (field: keyof LoginData) => (e: FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLogin(formData);

    if (!isValidLogin(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await login(formData).unwrap();
      console.log("Login success:", result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Login</h2>

      <Input
        label="Username"
        type="text"
        value={formData.username}
        onChange={handleChange("username")}
        error={errors.username}
        placeholder="Enter your username"
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        placeholder="Enter your password"
      />

      <Button type="submit" loading={isLoading}>
        Sign In
      </Button>
    </form>
  );
};