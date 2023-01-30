/**
 * @typedef {import('./complex-types.js').MdxFlowExpression} MdxFlowExpression
 * @typedef {import('./complex-types.js').MdxTextExpression} MdxTextExpression
 */

/**
 * @typedef {MdxFlowExpression} MDXFlowExpression
 *   Deprecated: use `MdxFlowExpression`.
 * @typedef {MdxTextExpression} MDXTextExpression
 *   Deprecated: use `MdxFlowExpression`.
 */

export {
  mdxExpressionFromMarkdown,
  mdxExpressionToMarkdown
} from './lib/index.js'
