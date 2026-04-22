import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${loading ? styles.loading : ""} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className={styles.spinner} /> : children}
      </button>
    );
  },
);

Button.displayName = "Button";
