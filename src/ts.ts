export type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

export type Nullable<T> = null | T;

export type ReleaseRule = {
  /**
   * Commit type.
   * Eg: feat, fix etc.
   */
  type: string;
  /**
   * Release types.
   * Eg: major, minor, patch etc.
   */
  release: string;
  scope?: string;
};

export type ChangelogRule = {
  /**
   * Commit type.
   * Eg: feat, fix etc.
   */
  type: string;
  /**
   * Section in changelog to group commits by type.
   * Eg: 'Bug Fix', 'Features' etc.
   */
  section?: string;
};
