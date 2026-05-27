import { useState } from "react";

export default function useToast() {

  const [toasts, setToasts] = useState([]);

  const pushToast = (
    msg,
    type = "success"
  ) => {

    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      {
        id,
        msg,
        type,
      },
    ]);

    setTimeout(() => {

      setToasts((prev) =>
        prev.filter((x) => x.id !== id)
      );

    }, 4000);
  };

  return {
    toasts,
    pushToast,
  };
}