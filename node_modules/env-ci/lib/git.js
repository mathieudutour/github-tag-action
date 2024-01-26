import { execaSync } from "execa";

export function head(options) {
  try {
    return execaSync("git", ["rev-parse", "HEAD"], options).stdout;
  } catch {
    return undefined;
  }
}

export function branch(options) {
  try {
    const headRef = execaSync(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      options,
    ).stdout;

    if (headRef === "HEAD") {
      const branch = execaSync(
        "git",
        ["show", "-s", "--pretty=%d", "HEAD"],
        options,
      )
        .stdout.replace(/^\(|\)$/g, "")
        .split(", ")
        .find((branch) => branch.startsWith("origin/"));
      return branch ? branch.match(/^origin\/(?<branch>.+)/)[1] : undefined;
    }

    return headRef;
  } catch {
    return undefined;
  }
}
