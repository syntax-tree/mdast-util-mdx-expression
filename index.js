import stripIndent from 'strip-indent'

const eol = /\r?\n|\r/g

export const mdxExpressionFromMarkdown = {
  enter: {
    mdxFlowExpression: enterMdxFlowExpression,
    mdxTextExpression: enterMdxTextExpression
  },
  exit: {
    mdxFlowExpression: exitMdxExpression,
    mdxFlowExpressionChunk: exitMdxExpressionData,
    mdxTextExpression: exitMdxExpression,
    mdxTextExpressionChunk: exitMdxExpressionData
  }
}

export const mdxExpressionToMarkdown = {
  handlers: {
    mdxFlowExpression: handleMdxExpression,
    mdxTextExpression: handleMdxExpression
  },
  unsafe: [
    {character: '{', inConstruct: ['phrasing']},
    {atBreak: true, character: '{'}
  ]
}

function enterMdxFlowExpression(token) {
  this.enter({type: 'mdxFlowExpression', value: ''}, token)
  this.buffer()
}

function enterMdxTextExpression(token) {
  this.enter({type: 'mdxTextExpression', value: ''}, token)
  this.buffer()
}

function exitMdxExpression(token) {
  const value = this.resume()
  const node = this.exit(token)

  node.value = token.type === 'mdxFlowExpression' ? dedent(value) : value

  if (token.estree) {
    node.data = {estree: token.estree}
  }
}

function exitMdxExpressionData(token) {
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

function handleMdxExpression(node) {
  const value = node.value || ''
  return '{' + (node.type === 'mdxFlowExpression' ? indent(value) : value) + '}'
}

function dedent(value) {
  const firstLineEnding = /\r?\n|\r/.exec(value)
  const position = firstLineEnding
    ? firstLineEnding.index + firstLineEnding[0].length
    : -1

  if (position > -1) {
    return value.slice(0, position) + stripIndent(value.slice(position))
  }

  return value
}

function indent(value) {
  const result = []
  let start = 0
  let line = 0
  let match

  while ((match = eol.exec(value))) {
    one(value.slice(start, match.index))
    result.push(match[0])
    start = match.index + match[0].length
    line++
  }

  one(value.slice(start))

  return result.join('')

  function one(slice) {
    result.push((line && slice ? '  ' : '') + slice)
  }
}
