import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountMenu } from "./AccountMenu";

describe("AccountMenu", () => {
  it("renders the avatar with initials, menu closed by default", () => {
    render(<AccountMenu initials="TE" signOutAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: /TE/ })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu on click, showing a disabled Settings item and a Log out item", async () => {
    const user = userEvent.setup();
    render(<AccountMenu initials="TE" signOutAction={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /TE/ }));

    const menu = screen.getByRole("menu");
    const settings = within(menu).getByRole("menuitem", { name: "Settings" });
    expect(settings).toBeDisabled();
    expect(within(menu).getByRole("menuitem", { name: "Log out" })).toBeEnabled();
  });

  it("closes the menu when clicking outside it", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AccountMenu initials="TE" signOutAction={vi.fn()} />
        <button type="button">Outside</button>
      </div>
    );

    await user.click(screen.getByRole("button", { name: /TE/ }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the menu on Escape", async () => {
    const user = userEvent.setup();
    render(<AccountMenu initials="TE" signOutAction={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /TE/ }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("invokes the sign-out action when Log out is clicked", async () => {
    const user = userEvent.setup();
    const signOutAction = vi.fn();
    render(<AccountMenu initials="TE" signOutAction={signOutAction} />);

    await user.click(screen.getByRole("button", { name: /TE/ }));
    await user.click(screen.getByRole("menuitem", { name: "Log out" }));

    expect(signOutAction).toHaveBeenCalledOnce();
  });

  it("clicking the disabled Settings item does not call the sign-out action", async () => {
    const user = userEvent.setup();
    const signOutAction = vi.fn();
    render(<AccountMenu initials="TE" signOutAction={signOutAction} />);

    await user.click(screen.getByRole("button", { name: /TE/ }));
    await user.click(screen.getByRole("menuitem", { name: "Settings" }));

    expect(signOutAction).not.toHaveBeenCalled();
  });
});
