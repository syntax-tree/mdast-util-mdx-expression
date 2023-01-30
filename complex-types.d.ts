import type {Literal} from 'mdast'
import type {Program} from 'estree-jsx'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxFlowExpression extends Literal {
  type: 'mdxFlowExpression'
  data?: {
    estree?: Program
  } & Literal['data']
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MdxTextExpression extends Literal {
  type: 'mdxTextExpression'
  data?: {
    estree?: Program
  } & Literal['data']
}

declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface StaticPhrasingContentMap {
    mdxTextExpression: MdxTextExpression
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface BlockContentMap {
    mdxFlowExpression: MdxFlowExpression
  }
}

declare module 'hast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootContentMap {
    mdxTextExpression: MdxTextExpression
    mdxFlowExpression: MdxFlowExpression
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ElementContentMap {
    mdxTextExpression: MdxTextExpression
    mdxFlowExpression: MdxFlowExpression
  }
}
