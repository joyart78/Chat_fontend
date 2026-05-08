import { useState } from "react";
import type { FormEvent } from "react";
import { Input, Button, Ref } from "@/shared/ui";
import {
  type RegistrationData,
  type RegistrationErrors,
  validateRegistration,
  isValidRegistration,
} from "@/entities/authRegistration";
import { useRegistrationMutation } from "@/entities/authRegistration/api/registrationApi";
import styles from "./RegistrationForm.module.css";

export const RegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationData>({
    login: "",
    password: "",
  });
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [registration, { isLoading }] = useRegistrationMutation();
  const handleChangeConfirm = (e: FormEvent<HTMLInputElement>) => {
    setConfirm(e.currentTarget.value);
  };

  const handleChange =
    (field: keyof RegistrationData) => (e: FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData, confirm);

    if (!isValidRegistration(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      console.log("registration", formData);
      const result = await registration(formData).unwrap();
      console.log("Registration success:", result);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Create Account</h2>

      <Input
        label="Username"
        type="text"
        value={formData.login}
        onChange={handleChange("login")}
        error={errors.login}
        placeholder="Enter your username"
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        placeholder="Create a password"
      />

      <Input
        label="Confirm Password"
        type="password"
        value={confirm}
        onChange={handleChangeConfirm}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
      />

      <Button type="submit" loading={isLoading}>
        Sign Up
      </Button>

      <Ref link="/login">Логин</Ref>
    </form>
  );
};
