import { useState } from "react";
import type { FormEvent } from "react";
import { Input, Button, Ref } from "@/shared/ui";
import {
  type LoginData,
  type LoginErrors,
  validateLogin,
  isValidLogin,
} from "@/entities/authLogin";
import { useLoginMutation } from "@/entities/authLogin/api/loginApi";
import styles from "./LoginForm.module.css";
import { useDispatch } from "react-redux";
import {
  setAccessToken,
  setIsAuth,
  setRefreshToken,
} from "@/entities/authLogin/model/slice/loginSlice.tsx";
import { jwtDecode } from "jwt-decode";
import type { Token } from "@/entities/authLogin";
import { useNavigate } from "react-router";

export const LoginForm = () => {
  const [formData, setFormData] = useState<LoginData>({
    login: "",
    password: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState<LoginErrors>({});
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useDispatch();

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
      dispatch(setAccessToken(result.token));
      const decoded: Token = jwtDecode(result.token);
      dispatch(setRefreshToken(decoded.refresh_token));
      dispatch(setIsAuth(true));
      navigate("chat");
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
        placeholder="Enter your password"
      />

      <Button type="submit" loading={isLoading}>
        Sign In
      </Button>

      <Ref link="/registration">
        Ещё не зарегистрированы? Зарегистрироваться!
      </Ref>
    </form>
  );
};
