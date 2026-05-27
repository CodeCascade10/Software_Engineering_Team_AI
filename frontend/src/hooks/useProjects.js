import { useEffect, useState } from "react";

export default function useProjects() {

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    const localProjects =
      JSON.parse(
        localStorage.getItem(
          "nexus_local_projects"
        ) || "[]"
      );

    setProjects(localProjects);

  }, []);

  return {
    projects,
    setProjects,

    loading,
    setLoading,
  };
}