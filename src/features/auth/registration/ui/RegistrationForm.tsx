import { useState } from "react";
import type { FormEvent } from "react";
import { Input, Button } from "@/shared/ui";
import {
  type RegistrationData,
  type RegistrationErrors,
  validateRegistration,
  isValidRegistration,
} from "@/entities/authRegistration";
import styles from "./RegistrationForm.module.css";

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => Promise<void>;
}

export const RegistrationForm = ({ onSubmit }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<RegistrationData>({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [loading, setLoading] = useState(false);

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
    const validationErrors = validateRegistration(formData);

    if (!isValidRegistration(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Create Account</h2>

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
        placeholder="Create a password"
      />

      <Input
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
      />

      <Button type="submit" loading={loading}>
        Sign Up
      </Button>
    </form>
  );
};
