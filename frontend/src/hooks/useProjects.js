import { useEffect, useState } from "react";

import { listProjects } from "../services/projectService";


export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listProjects()
      .then((items) => {
        if (active) setProjects(items);
      })
      .catch((error) => {
        console.error("Could not load projects", error.response?.status || error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { projects, setProjects, loading, setLoading };
}
