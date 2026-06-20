const mermaidLanguageClass = "language-mermaid";

const isMermaidCodeBlock = (node) => {
  if (!node || node.type !== "element" || node.tagName !== "pre") {
    return false;
  }

  const code = node.children?.[0];
  const className = code?.properties?.className ?? [];

  return (
    code?.type === "element" &&
    code.tagName === "code" &&
    Array.isArray(className) &&
    className.includes(mermaidLanguageClass)
  );
};

const toText = (node) => {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.value ?? "";
  }

  return node.children?.map(toText).join("") ?? "";
};

export default function rehypeMermaidBlocks() {
  return (tree) => {
    const visit = (node) => {
      if (!node?.children) {
        return;
      }

      node.children = node.children.map((child) => {
        if (!isMermaidCodeBlock(child)) {
          visit(child);
          return child;
        }

        const source = toText(child.children[0]).trim();

        return {
          type: "element",
          tagName: "div",
          properties: {
            className: ["mermaid-diagram", "not-prose"],
          },
          children: [
            {
              type: "element",
              tagName: "pre",
              properties: {
                className: ["mermaid-diagram__source"],
              },
              children: [{ type: "text", value: source }],
            },
          ],
        };
      });
    };

    visit(tree);
  };
}
