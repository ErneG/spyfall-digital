import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Providers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("loads React Query devtools in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const loadSpy = vi.fn();

    vi.doMock("@tanstack/react-query-devtools", () => {
      loadSpy();
      return {
        ReactQueryDevtools: () => <div data-testid="react-query-devtools">Devtools</div>,
      };
    });

    const { Providers } = await import("./providers");

    render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    expect(screen.getByText("Child")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("react-query-devtools")).toBeInTheDocument();
    });
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it("does not load React Query devtools in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const loadSpy = vi.fn();

    vi.doMock("@tanstack/react-query-devtools", () => {
      loadSpy();
      return {
        ReactQueryDevtools: () => <div data-testid="react-query-devtools">Devtools</div>,
      };
    });

    const { Providers } = await import("./providers");

    render(
      <Providers>
        <div>Child</div>
      </Providers>,
    );

    expect(screen.getByText("Child")).toBeInTheDocument();
    expect(screen.queryByTestId("react-query-devtools")).not.toBeInTheDocument();
    expect(loadSpy).not.toHaveBeenCalled();
  });
});
