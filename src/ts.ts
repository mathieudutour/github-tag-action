export type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

export type Nullable<T> = null | T;

export type ConventionalCommit = {
  hash: string;
  header: string;
  type: string;
  scope: string;
  subject: string;
  body: Nullable<string>;
  footer: string;
  notes: Array<{ title: string, text: string }>;
  version: string;
  title: string;
  references: Array<{
      action: string;
      owner: Nullable<string>;
      repository: Nullable<string>;
      issue: string;
      raw: string;
  }>;
  revert: boolean;
  shortHash?: string;
};

export type ConventionalChangelogContext = {
  version: string;
  title: string;
  isPatch: boolean;
  host: string;
  owner: string;
  repository: string;
  repoUrl: string;
};

export type ConventionalCommitPresetConfig = {
  types: CustomReleaseRule[];
};

export type CustomReleaseRule = {
  /**
   * Release types.
   * Eg: major, minor, patch etc.
   */
  release: string;
  /**
   * Commit type.
   * Eg: feat, fix etc.
   */
  type: string;
  /**
   * Section in changelog to group commits by type.
   * Eg: 'Bug Fix', 'Features' etc.
   */
  section: string;
  /**
   * Hide a section in the changelog.
   */
  hidden?: boolean;
};
