/**
 * @typedef {import('mdast').Literal} Literal
 * @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
 * @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('estree-jsx').Program} Estree
 *
 * @typedef {Literal & {type: 'mdxFlowExpression', data: {estree?: Estree}}} MDXFlowExpression
 * @typedef {Literal & {type: 'mdxSpanExpression', data: {estree?: Estree}}} MDXSpanExpression
 */

import stripIndent from 'strip-indent'

const eol = /\r?\n|\r/g

/** @type {FromMarkdownExtension} */
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

/** @type {ToMarkdownExtension} */
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

/** @type {FromMarkdownHandle} */
function enterMdxFlowExpression(token) {
  // @ts-expect-error: fine.
  this.enter({type: 'mdxFlowExpression', value: ''}, token)
  this.buffer()
}

/** @type {FromMarkdownHandle} */
function enterMdxTextExpression(token) {
  // @ts-expect-error: fine.
  this.enter({type: 'mdxTextExpression', value: ''}, token)
  this.buffer()
}

/** @type {FromMarkdownHandle} */
function exitMdxExpression(token) {
  const value = this.resume()
  const node = this.exit(token)

  node.value = token.type === 'mdxFlowExpression' ? dedent(value) : value

  // @ts-expect-error: estree.
  if (token.estree) {
    // @ts-expect-error: estree.
    node.data = {estree: token.estree}
  }
}

/** @type {FromMarkdownHandle} */
function exitMdxExpressionData(token) {
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

/**
 * @type {ToMarkdownHandle}
 * @param {MDXFlowExpression|MDXSpanExpression} node
 */
function handleMdxExpression(node) {
  const value = node.value || ''
  return '{' + (node.type === 'mdxFlowExpression' ? indent(value) : value) + '}'
}

/**
 * @param {string} value
 * @returns {string}
 */
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

/**
 * @param {string} value
 * @returns {string}
 */
function indent(value) {
  /** @type {Array.<string>} */
  const result = []
  let start = 0
  let line = 0
  /** @type {RegExpExecArray|null} */
  let match

  while ((match = eol.exec(value))) {
    one(value.slice(start, match.index))
    result.push(match[0])
    start = match.index + match[0].length
    line++
  }

  one(value.slice(start))

  return result.join('')

  /**
   * @param {string} slice
   * @returns {void}
   */
  function one(slice) {
    result.push((line && slice ? '  ' : '') + slice)
  }
}
