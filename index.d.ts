import type {Literal} from 'mdast'
import type {Program} from 'estree-jsx'

export {
  mdxExpressionFromMarkdown,
  mdxExpressionToMarkdown
} from './lib/index.js'

/**
 * MDX expression node, occurring in flow (block).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxFlowExpression extends Literal {
  /**
   * Node type.
   */
  type: 'mdxFlowExpression'

  /**
   * Data.
   */
  data?: {
    /**
     * Program node from estree.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    estree?: Program | null | undefined
  } & Literal['data']
}

/**
 * MDX expression node, occurring in text (phrasing).
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxTextExpression extends Literal {
  /**
   * Node type.
   */
  type: 'mdxTextExpression'

  /**
   * Data.
   */
  data?: {
    /**
     * Program node from estree.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    estree?: Program | null | undefined
  } & Literal['data']
}

/**
 * Deprecated: use `MdxFlowExpression`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type MDXFlowExpression = MdxFlowExpression

/**
 * Deprecated: use `MdxTextExpression`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type MDXTextExpression = MdxTextExpression

// Add nodes to mdast content.
declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StaticPhrasingContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
  }
}

declare module 'hast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ElementContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
  }
}
