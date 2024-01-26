export default function isPrerelease({ type, main }) {
  return type === "prerelease" || (type === "release" && !main);
}
