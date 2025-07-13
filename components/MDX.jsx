import Markdown from "markdown-to-jsx";
import TopNav from "./TopNav";

export default function MDX(props) {
  const { text } = props; //gives us access to the text attributes
  const md = `# This is a header 1 
## This is a header 2

hello world

[click me](https://www.google.com)
  `
  return (
    <section className="mdx-container">
      <TopNav {...props} />
      <article>
        <Markdown>
          {text.trim() || 'Hop in the editor to create a new note'}
        </Markdown>
      </article>
    </section>
  );
}
