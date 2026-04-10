import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";

describe("Dialog", () => {
  it("uses the light glass content and footer styles by default", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(document.body.querySelector("[data-slot='dialog-content']")?.className).toContain(
      "bg-white/82",
    );
    expect(document.body.querySelector("[data-slot='dialog-footer']")?.className).toContain(
      "bg-white/72",
    );
  });
});
