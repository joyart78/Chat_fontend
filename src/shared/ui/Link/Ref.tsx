import { Link } from "react-router";
import styles from "./Ref.module.css";
import type { ReactNode } from "react";

interface RefI {
  link: string;
  children: ReactNode;
}

export const Ref = ({ link, children }: RefI) => {
  return (
    <>
      <Link className={styles.link} to={link}>
        {children}
      </Link>
    </>
  );
};
