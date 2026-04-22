import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className={`${styles.inputWrapper} ${className}`}>
        {label && <label className={styles.inputLabel}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.inputField} ${error ? styles.inputError : ""}`}
          {...props}
        />
        {error && <span className={styles.inputErrorText}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
