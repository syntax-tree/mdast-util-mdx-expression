import test from 'tape'
import * as acorn from 'acorn'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'
import {mdxExpression} from 'micromark-extension-mdx-expression'
import {mdxExpressionFromMarkdown, mdxExpressionToMarkdown} from './index.js'

test('markdown -> mdast', (t) => {
  t.deepEqual(
    fromMarkdown('{1 + 1}', {
      extensions: [mdxExpression()],
      mdastExtensions: [mdxExpressionFromMarkdown]
    }),
    {
      type: 'root',
      children: [
        {
          type: 'mdxFlowExpression',
          value: '1 + 1',
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 8, offset: 7}
          }
        }
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 8, offset: 7}
      }
    },
    'should support a flow expression (agnostic)'
  )

  t.deepEqual(
    fromMarkdown('{\n  1 + 1\n}', {
      extensions: [mdxExpression()],
      mdastExtensions: [mdxExpressionFromMarkdown]
    }),
    {
      type: 'root',
      children: [
        {
          type: 'mdxFlowExpression',
          value: '\n1 + 1\n',
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 3, column: 2, offset: 11}
          }
        }
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 3, column: 2, offset: 11}
      }
    },
    'should support a flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{\t \n}', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {type: 'root', children: [{type: 'mdxFlowExpression', value: '\t \n'}]},
    'should support an empty flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a { b } c }', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'mdxFlowExpression', value: ' a { b } c '}]
    },
    'should support an balanced braces in a flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a /* { */ }', {
        extensions: [mdxExpression({acorn})],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'mdxFlowExpression', value: ' a /* { */ '}]
    },
    'should support a commented-out unbalanced brace in a flow expression (gnostic)'
  )

  t.deepEqual(
    fromMarkdown('a {1 + 1} b', {
      extensions: [mdxExpression()],
      mdastExtensions: [mdxExpressionFromMarkdown]
    }),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'a ',
              position: {
                start: {line: 1, column: 1, offset: 0},
                end: {line: 1, column: 3, offset: 2}
              }
            },
            {
              type: 'mdxTextExpression',
              value: '1 + 1',
              position: {
                start: {line: 1, column: 3, offset: 2},
                end: {line: 1, column: 10, offset: 9}
              }
            },
            {
              type: 'text',
              value: ' b',
              position: {
                start: {line: 1, column: 10, offset: 9},
                end: {line: 1, column: 12, offset: 11}
              }
            }
          ],
          position: {
            start: {line: 1, column: 1, offset: 0},
            end: {line: 1, column: 12, offset: 11}
          }
        }
      ],
      position: {
        start: {line: 1, column: 1, offset: 0},
        end: {line: 1, column: 12, offset: 11}
      }
    },
    'should support a text expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('a {\t \n} c', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a '},
            {type: 'mdxTextExpression', value: '\t \n'},
            {type: 'text', value: ' c'}
          ]
        }
      ]
    },
    'should support an empty text expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a { b } c }.', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'mdxTextExpression', value: ' a { b } c '},
            {type: 'text', value: '.'}
          ]
        }
      ]
    },
    'should support an balanced braces in a flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a /* { */ }.', {
        extensions: [mdxExpression({acorn})],
        mdastExtensions: [mdxExpressionFromMarkdown]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'mdxTextExpression', value: ' a /* { */ '},
            {type: 'text', value: '.'}
          ]
        }
      ]
    },
    'should support a commented-out unbalanced brace in a flow expression (gnostic)'
  )

  t.deepEqual(
    // Cheap clone to remove non-JSON values.
    JSON.parse(
      JSON.stringify(
        removePosition(
          fromMarkdown('{a}.', {
            extensions: [mdxExpression({acorn, addResult: true})],
            mdastExtensions: [mdxExpressionFromMarkdown]
          }),
          true
        )
      )
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'mdxTextExpression',
              value: 'a',
              data: {
                estree: {
                  type: 'Program',
                  start: 1,
                  end: 2,
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'Identifier',
                        start: 1,
                        end: 2,
                        name: 'a',
                        loc: {
                          start: {line: 1, column: 1},
                          end: {line: 1, column: 2}
                        },
                        range: [1, 2]
                      },
                      start: 1,
                      end: 2,
                      loc: {
                        start: {line: 1, column: 1},
                        end: {line: 1, column: 2}
                      },
                      range: [1, 2]
                    }
                  ],
                  sourceType: 'module',
                  comments: [],
                  loc: {start: {line: 1, column: 1}, end: {line: 1, column: 2}},
                  range: [1, 2]
                }
              }
            },
            {type: 'text', value: '.'}
          ]
        }
      ]
    },
    'should add a `data.estree` if `addResult` was used in the syntax extension'
  )

  t.deepEqual(
    // Cheap clone to remove non-JSON values.
    JSON.parse(
      JSON.stringify(
        removePosition(
          fromMarkdown('A {/*b*/ c // d\n} e {/* f */}.', {
            extensions: [mdxExpression({acorn, addResult: true})],
            mdastExtensions: [mdxExpressionFromMarkdown]
          }),
          true
        )
      )
    ),
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'A '},
            {
              type: 'mdxTextExpression',
              value: '/*b*/ c // d\n',
              data: {
                estree: {
                  type: 'Program',
                  start: 3,
                  end: 16,
                  body: [
                    {
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'Identifier',
                        start: 9,
                        end: 10,
                        name: 'c',
                        loc: {
                          start: {line: 1, column: 9},
                          end: {line: 1, column: 10}
                        },
                        range: [9, 10]
                      },
                      start: 3,
                      end: 16,
                      loc: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 16}
                      },
                      range: [3, 16]
                    }
                  ],
                  sourceType: 'module',
                  comments: [
                    {
                      type: 'Block',
                      value: 'b',
                      start: 3,
                      end: 8,
                      loc: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 8}
                      },
                      range: [3, 8]
                    },
                    {
                      type: 'Line',
                      value: ' d',
                      start: 11,
                      end: 15,
                      loc: {
                        start: {line: 1, column: 11},
                        end: {line: 1, column: 15}
                      },
                      range: [11, 15]
                    }
                  ],
                  loc: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 16}
                  },
                  range: [3, 16]
                }
              }
            },
            {type: 'text', value: ' e '},
            {
              type: 'mdxTextExpression',
              value: '/* f */',
              data: {
                estree: {
                  type: 'Program',
                  start: 21,
                  end: 28,
                  body: [],
                  sourceType: 'module',
                  comments: [
                    {
                      type: 'Block',
                      value: ' f ',
                      start: 21,
                      end: 28,
                      loc: {
                        start: {line: 2, column: 5},
                        end: {line: 2, column: 12}
                      },
                      range: [21, 28]
                    }
                  ],
                  loc: {
                    start: {line: 2, column: 5},
                    end: {line: 2, column: 12}
                  },
                  range: [21, 28]
                }
              }
            },
            {type: 'text', value: '.'}
          ]
        }
      ]
    },
    'should support comments in expressions'
  )

  t.end()
})

test('mdast -> markdown', (t) => {
  t.deepEqual(
    toMarkdown(
      {
        type: 'root',
        children: [
          {type: 'mdxFlowExpression', value: 'a + b'},
          {type: 'mdxFlowExpression', value: '\nc +\n1\n'},
          // @ts-expect-error: `value` missing.
          {type: 'mdxFlowExpression'},
          {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
        ]
      },
      {extensions: [mdxExpressionToMarkdown]}
    ),
    '{a + b}\n\n{\n  c +\n  1\n}\n\n{}\n\nd\n',
    'should serialize flow expressions'
  )

  t.deepEqual(
    toMarkdown(
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'a '},
          {type: 'mdxTextExpression', value: 'b + c'},
          {type: 'text', value: ', d '},
          {type: 'mdxTextExpression', value: 'e + 1'},
          {type: 'text', value: ', f '},
          // @ts-expect-error: `value` missing.
          {type: 'mdxTextExpression'},
          {type: 'text', value: '.'}
        ]
      },
      {extensions: [mdxExpressionToMarkdown]}
    ),
    'a {b + c}, d {e + 1}, f {}.\n',
    'should serialize text expressions'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'paragraph', children: [{type: 'text', value: 'a { b'}]},
      {extensions: [mdxExpressionToMarkdown]}
    ),
    'a \\{ b\n',
    'should escape `{` in text'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'definition', identifier: 'a', url: 'x', title: 'a\n{\nb'},
      {extensions: [mdxExpressionToMarkdown]}
    ),
    '[a]: x "a\n\\{\nb"\n',
    'should escape `{` at the start of a line'
  )

  t.end()
})
