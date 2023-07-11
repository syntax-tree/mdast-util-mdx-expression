import type {Program} from 'estree-jsx'
import type {Literal as HastLiteral} from 'hast'
import type {Literal as MdastLiteral} from 'mdast'

export {
  mdxExpressionFromMarkdown,
  mdxExpressionToMarkdown
} from './lib/index.js'

/**
 * MDX expression node, occurring in flow (block).
 */
export interface MdxFlowExpression extends MdastLiteral {
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
    estree?: Program | null | undefined
  } & MdastLiteral['data']
}

/**
 * MDX expression node, occurring in text (phrasing).
 */
export interface MdxTextExpression extends MdastLiteral {
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
    estree?: Program | null | undefined
  } & MdastLiteral['data']
}

/**
 * MDX expression node, occurring in flow (block), for hast.
 */
export interface MdxFlowExpressionHast extends HastLiteral {
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
    estree?: Program | null | undefined
  } & HastLiteral['data']
}

/**
 * MDX expression node, occurring in text (phrasing), for hast.
 */
export interface MdxTextExpressionHast extends HastLiteral {
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
    estree?: Program | null | undefined
  } & HastLiteral['data']
}

// Add nodes to mdast content.
declare module 'mdast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
  }

  interface PhrasingContentMap {
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpression
  }

  interface BlockContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpression
  }
}

// Add nodes to hast content.
declare module 'hast' {
  interface RootContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast
  }

  interface ElementContentMap {
    /**
     * MDX expression node, occurring in flow (block).
     */
    mdxFlowExpression: MdxFlowExpressionHast
    /**
     * MDX expression node, occurring in text (phrasing).
     */
    mdxTextExpression: MdxTextExpressionHast
  }
}
