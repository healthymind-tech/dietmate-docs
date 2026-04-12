/**
 * Remark plugin: transforms FAQ sections into collapsible <details>/<summary> elements.
 *
 * Pattern: under a ## heading that contains "常見問題", each ### heading and its
 * following paragraph/list nodes are wrapped in <details><summary>...</summary>...</details>.
 * MDX files do not need to change.
 */
export function remarkFaqAccordion() {
  return (tree) => {
    const original = tree.children
    const result = []
    let i = 0

    while (i < original.length) {
      const node = original[i]

      if (isFaqH2(node)) {
        result.push(node)
        i++

        // Process everything until the next h2 (or end)
        while (i < original.length) {
          const cur = original[i]

          // Another h2 ends the FAQ section
          if (cur.type === 'heading' && cur.depth <= 2) break

          // h3 starts a new FAQ item
          if (cur.type === 'heading' && cur.depth === 3) {
            const questionText = extractText(cur)
            const body = []
            i++

            // Collect body nodes until the next heading
            while (i < original.length && original[i].type !== 'heading') {
              body.push(original[i])
              i++
            }

            result.push(makeDetailsNode(questionText, body))
          } else {
            result.push(cur)
            i++
          }
        }
        continue
      }

      result.push(node)
      i++
    }

    tree.children = result
  }
}

function isFaqH2(node) {
  return (
    node.type === 'heading' &&
    node.depth === 2 &&
    extractText(node).includes('常見問題')
  )
}

function extractText(node) {
  if (!node.children) return node.value ?? ''
  return node.children.map(extractText).join('')
}

function attr(name, value) {
  return { type: 'mdxJsxAttribute', name, value }
}

function makeDetailsNode(questionText, bodyNodes) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'details',
    attributes: [attr('className', 'faq-item')],
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'summary',
        attributes: [attr('className', 'faq-summary')],
        children: [
          { type: 'text', value: questionText },
          {
            type: 'mdxJsxFlowElement',
            name: 'span',
            attributes: [attr('className', 'faq-chevron')],
            children: [],
          },
        ],
      },
      {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [attr('className', 'faq-body')],
        children: bodyNodes,
      },
    ],
  }
}
