import styles from "../styles/AddButton.module.css";
import { Pencil2Icon } from "@radix-ui/react-icons";

export default function AddButton() {
    return (
      <button type="button" className={styles['add-btn-root']}>
        <Pencil2Icon className="h-6 w-6" />
      </button>
    )
  }
  