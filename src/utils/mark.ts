import MarkdownIt from "markdown-it"
import mdi_emoji from "markdown-it-emoji"
import mdi_mark from "markdown-it-mark"

export let reMarks: RegExp

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
}

export function updateReMarks(marks: string[]) {
  const pattern = "(" + marks.map(escapeRegex).join("|") + ")"
  try {
    reMarks = new RegExp(pattern, "g")
  } catch (err) {
    console.error(err)
  }
}

export function splitTerms(s: string): string[] {
  const terms = /("([^"]+)(?:"|$)|(?:\S+))/g
  const matches = Array.from(s.matchAll(terms))
  console.debug(matches)
  return matches.map((i) => {
    return (i[2] ?? i[0]).toLowerCase()
  })
}

export const mdIt = new MarkdownIt({ breaks: true, linkify: true })
  .use(mdi_emoji as any)
  .use(mdi_mark as any)
