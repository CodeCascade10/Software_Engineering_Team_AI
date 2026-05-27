import { useEffect, useMemo, useState } from "react";

export default function useCommandPalette(
  ALL_COMMANDS
) {

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] =
    useState(false);

  const [commandPaletteQuery, setCommandPaletteQuery] =
    useState("");

  // Keyboard Shortcuts
  useEffect(() => {

    const handleKeyDown = (e) => {

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "k"
      ) {
        e.preventDefault();

        setIsCommandPaletteOpen((prev) => !prev);
      }

      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

  }, []);

  // Filter Commands
  const filteredCommands = useMemo(() => {

    return ALL_COMMANDS.filter(
      (item) =>
        item.cmd
          .toLowerCase()
          .includes(
            commandPaletteQuery.toLowerCase()
          ) ||
        item.desc
          .toLowerCase()
          .includes(
            commandPaletteQuery.toLowerCase()
          )
    );

  }, [ALL_COMMANDS, commandPaletteQuery]);

  return {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,

    commandPaletteQuery,
    setCommandPaletteQuery,

    filteredCommands,
  };
}