export async function createLocalProject(
  prompt,
  projects,
  setProjects,
  pushToast
) {

  if (!prompt.trim()) {
    pushToast(
      "Project prompt cannot be empty",
      "error"
    );

    return;
  }

  const newProject = {
    _id: Date.now().toString(),

    title:
      prompt.split(" ").slice(0, 4).join(" ") ||
      "Untitled Project",

    prompt,

    status: "active",

    created_at: new Date().toISOString(),
  };

  const updatedProjects = [
    newProject,
    ...projects,
  ];

  setProjects(updatedProjects);

  localStorage.setItem(
    "nexus_local_projects",
    JSON.stringify(updatedProjects)
  );

  pushToast(
    "Project workspace created successfully",
    "success"
  );

  return newProject;
}

export async function fetchProjectFiles(
  projectId,
  setProjectFiles,
  setOpenedProject,
  setActiveFileTab,
  setEditingFileContent,
  pushToast
) {

  try {

    pushToast(
      "Loading project sandbox files..."
    );

    await new Promise((res) =>
      setTimeout(res, 1200)
    );

    const mockFiles = [
      {
        file_name: "main.py",

        content:
`from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "AI Software Team Running"
    }`,
      },

      {
        file_name: "requirements.txt",

        content:
`fastapi
uvicorn
pydantic`,
      },

      {
        file_name: "docker-compose.yml",

        content:
`version: '3'

services:
  api:
    build: .
    ports:
      - "8000:8000"`,
      },
    ];

    setProjectFiles((prev) => ({
      ...prev,
      [projectId]: mockFiles,
    }));

    setOpenedProject(projectId);

    setActiveFileTab(
      mockFiles[0].file_name
    );

    setEditingFileContent(
      mockFiles[0].content
    );

    pushToast(
      "Sandbox files mounted",
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Failed to fetch project files",
      "error"
    );
  }
}

export async function saveProjectFile(
  openedProject,
  activeFileTab,
  editingFileContent,
  setProjectFiles,
  setIsEditingFile,
  pushToast
) {

  try {

    setProjectFiles((prev) => {

      const updated =
        prev[openedProject].map((file) => {

          if (
            file.file_name === activeFileTab
          ) {
            return {
              ...file,
              content: editingFileContent,
            };
          }

          return file;
        });

      return {
        ...prev,
        [openedProject]: updated,
      };
    });

    setIsEditingFile(false);

    pushToast(
      `${activeFileTab} saved successfully`,
      "success"
    );

  } catch (err) {

    console.error(err);

    pushToast(
      "Failed to save file",
      "error"
    );
  }
}