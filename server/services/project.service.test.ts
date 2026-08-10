import { describe, it, expect, vi, beforeEach } from "vitest";
import { projectService } from "./project.service";
import { projectRepository } from "@/server/repositories/project.repository";
import { documentRepository } from "@/server/repositories/document.repository";

vi.mock("@/server/repositories/project.repository", () => ({
  projectRepository: {
    listByUserId: vi.fn(),
    getByIdForUser: vi.fn(),
    findByUserClientAndName: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/server/repositories/document.repository", () => ({
  documentRepository: {
    listByUserId: vi.fn(),
    listByProjectIdForUser: vi.fn(),
  },
}));

const listByUserId = vi.mocked(projectRepository.listByUserId);
const getByIdForUser = vi.mocked(projectRepository.getByIdForUser);
const findByUserClientAndName = vi.mocked(projectRepository.findByUserClientAndName);
const create = vi.mocked(projectRepository.create);
const listDocsByUserId = vi.mocked(documentRepository.listByUserId);
const listDocsByProjectId = vi.mocked(documentRepository.listByProjectIdForUser);

function fakeProject(overrides: Partial<Awaited<ReturnType<typeof projectRepository.create>>> = {}) {
  return {
    id: "project-1",
    userId: "user-1",
    name: "Website redesign",
    clientId: null,
    clientName: "Acme Co",
    createdAt: new Date("2026-08-01T00:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  listByUserId.mockReset();
  getByIdForUser.mockReset();
  findByUserClientAndName.mockReset();
  create.mockReset();
  listDocsByUserId.mockReset();
  listDocsByProjectId.mockReset();
});

describe("projectService.findOrCreateForDocument", () => {
  it("reuses an existing project when one matches (clientName, name)", async () => {
    findByUserClientAndName.mockResolvedValue(fakeProject());

    const id = await projectService.findOrCreateForDocument("user-1", {
      clientId: null,
      clientName: "Acme Co",
      name: "Website redesign",
    });

    expect(id).toBe("project-1");
    expect(create).not.toHaveBeenCalled();
  });

  it("creates a new project when no match exists", async () => {
    findByUserClientAndName.mockResolvedValue(null);
    create.mockResolvedValue(fakeProject({ id: "project-2" }));

    const id = await projectService.findOrCreateForDocument("user-1", {
      clientId: "client-1",
      clientName: "Acme Co",
      name: "Website redesign",
    });

    expect(id).toBe("project-2");
    expect(create).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Website redesign",
      clientId: "client-1",
      clientName: "Acme Co",
    });
  });
});

describe("projectService.listForUser", () => {
  it("attaches a document count per project", async () => {
    listByUserId.mockResolvedValue([fakeProject({ id: "p1" }), fakeProject({ id: "p2" })]);
    listDocsByUserId.mockResolvedValue([
      { id: "d1", projectId: "p1" },
      { id: "d2", projectId: "p1" },
      { id: "d3", projectId: "p2" },
      { id: "d4", projectId: null },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    const result = await projectService.listForUser("user-1");

    expect(result.find((p) => p.id === "p1")?.documentCount).toBe(2);
    expect(result.find((p) => p.id === "p2")?.documentCount).toBe(1);
  });
});

describe("projectService.getWithDocuments", () => {
  it("throws not_found when the project doesn't belong to the caller", async () => {
    getByIdForUser.mockResolvedValue(null);
    await expect(projectService.getWithDocuments("user-1", "project-1")).rejects.toThrow();
  });

  it("returns the project with its documents when found", async () => {
    getByIdForUser.mockResolvedValue(fakeProject());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listDocsByProjectId.mockResolvedValue([{ id: "d1" }] as any);

    const result = await projectService.getWithDocuments("user-1", "project-1");
    expect(result.project.id).toBe("project-1");
    expect(result.documents).toHaveLength(1);
  });
});
