import API from "../api/axios";

export async function createProject(prompt, stack, setProjects, pushToast) {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) throw new Error("Project prompt cannot be empty");

  const title = normalizedPrompt.split(/\s+/).slice(0, 8).join(" ") || "Untitled project";
  const response = await API.post("/projects/create", {
    title,
    prompt: normalizedPrompt,
    stack: stack || "FastAPI",
  });
  const project = response.data.project;
  setProjects((previous) => [project, ...previous]);
  pushToast("Project workspace created", "success");
  return project;
}

export async function listProjects() {
  const response = await API.get("/projects/my-projects");
  return response.data;
}

export async function fetchProjectFiles(
  projectId,
  setProjectFiles,
  setOpenedProject,
  setActiveFileTab,
  setEditingFileContent,
  pushToast,
) {
  const response = await API.get(`/files/${encodeURIComponent(projectId)}`);
  const files = response.data.files || [];
  const initialFile = files.find((file) =>
    ["main.py", "server.js", "index.js"].includes(file.file_name),
  ) || files[0];

  setProjectFiles((previous) => ({ ...previous, [projectId]: files }));
  setOpenedProject(projectId);
  setActiveFileTab(initialFile?.file_name || "");
  setEditingFileContent(initialFile?.content || "");
  pushToast(files.length ? "Generated project files loaded" : "No generated files yet", files.length ? "success" : "error");
}

export async function saveProjectFile(
  openedProject,
  activeFileTab,
  editingFileContent,
  setProjectFiles,
  setIsEditingFile,
  pushToast,
) {
  if (!openedProject || !activeFileTab) throw new Error("Select a project file before saving");

  const encodedPath = activeFileTab.split("/").map(encodeURIComponent).join("/");
  await API.put(
    `/files/${encodeURIComponent(openedProject)}/${encodedPath}`,
    { content: editingFileContent },
  );

  setProjectFiles((previous) => ({
    ...previous,
    [openedProject]: (previous[openedProject] || []).map((file) =>
      file.file_name === activeFileTab ? { ...file, content: editingFileContent } : file,
    ),
  }));
  setIsEditingFile(false);
  pushToast(`${activeFileTab} saved`, "success");
}
