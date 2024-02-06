import { ISSUE_ID } from "./definitions/constants.js";

export default async (octokit, title, owner, repo) => {
  const {
    data: { items: issues },
  } = await octokit.request("GET /search/issues", {
    q: `in:title+repo:${owner}/${repo}+type:issue+state:open+${title}`,
  });

  return issues.filter((issue) => issue.body && issue.body.includes(ISSUE_ID));
};
