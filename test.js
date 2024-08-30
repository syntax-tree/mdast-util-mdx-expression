import assert from 'node:assert/strict'
import test from 'node:test'
import * as acorn from 'acorn'
import {mdxExpression} from 'micromark-extension-mdx-expression'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {
  mdxExpressionFromMarkdown,
  mdxExpressionToMarkdown
} from 'mdast-util-mdx-expression'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('mdast-util-mdx-expression')).sort(),
      ['mdxExpressionFromMarkdown', 'mdxExpressionToMarkdown']
    )
  })
})

test('mdxExpressionFromMarkdown()', async function (t) {
  await t.test(
    'should support a flow expression (agnostic)',
    async function () {
      assert.deepEqual(
        fromMarkdown('{1 + 1}', {
          extensions: [mdxExpression()],
          mdastExtensions: [mdxExpressionFromMarkdown()]
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
        }
      )
    }
  )

  await t.test(
    'should support a flow expression (agnostic)',
    async function () {
      assert.deepEqual(
        fromMarkdown('{\n  1 + 1\n}', {
          extensions: [mdxExpression()],
          mdastExtensions: [mdxExpressionFromMarkdown()]
        }),
        {
          type: 'root',
          children: [
            {
              type: 'mdxFlowExpression',
              value: '\n  1 + 1\n',
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
        }
      )
    }
  )

  await t.test(
    'should support an empty flow expression (agnostic)',
    async function () {
      const tree = fromMarkdown('{\t \n}', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'mdxFlowExpression', value: '\t \n'}]
      })
    }
  )

  await t.test(
    'should support an balanced braces in a flow expression (agnostic)',
    async function () {
      const tree = fromMarkdown('{ a { b } c }', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'mdxFlowExpression', value: ' a { b } c '}]
      })
    }
  )

  await t.test(
    'should support a commented-out unbalanced brace in a flow expression (gnostic)',
    async function () {
      const tree = fromMarkdown('{ a /* { */ }', {
        extensions: [mdxExpression({acorn})],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'mdxFlowExpression', value: ' a /* { */ '}]
      })
    }
  )

  await t.test(
    'should support a text expression (agnostic)',
    async function () {
      assert.deepEqual(
        fromMarkdown('a {1 + 1} b', {
          extensions: [mdxExpression()],
          mdastExtensions: [mdxExpressionFromMarkdown()]
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
        }
      )
    }
  )

  await t.test(
    'should support an empty text expression (agnostic)',
    async function () {
      const tree = fromMarkdown('a {\t \n} c', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
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
      })
    }
  )

  await t.test(
    'should support an balanced braces in a flow expression (agnostic)',
    async function () {
      const tree = fromMarkdown('{ a { b } c }.', {
        extensions: [mdxExpression()],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
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
      })
    }
  )

  await t.test(
    'should support a commented-out unbalanced brace in a flow expression (gnostic)',
    async function () {
      const tree = fromMarkdown('{ a /* { */ }.', {
        extensions: [mdxExpression({acorn})],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
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
      })
    }
  )

  await t.test(
    'should add a `data.estree` if `addResult` was used in the syntax extension',
    async function () {
      let tree = fromMarkdown('{a}.', {
        extensions: [mdxExpression({acorn, addResult: true})],
        mdastExtensions: [mdxExpressionFromMarkdown()]
      })

      removePosition(tree, {force: true})

      // Cheap clone to remove non-JSON values.
      // eslint-disable-next-line unicorn/prefer-structured-clone -- `JSON` to drop instances.
      tree = JSON.parse(JSON.stringify(tree))

      assert.deepEqual(tree, {
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
                            start: {line: 1, column: 1, offset: 1},
                            end: {line: 1, column: 2, offset: 2}
                          },
                          range: [1, 2]
                        },
                        start: 1,
                        end: 2,
                        loc: {
                          start: {line: 1, column: 1, offset: 1},
                          end: {line: 1, column: 2, offset: 2}
                        },
                        range: [1, 2]
                      }
                    ],
                    sourceType: 'module',
                    comments: [],
                    loc: {
                      start: {line: 1, column: 1, offset: 1},
                      end: {line: 1, column: 2, offset: 2}
                    },
                    range: [1, 2]
                  }
                }
              },
              {type: 'text', value: '.'}
            ]
          }
        ]
      })
    }
  )

  await t.test('should support comments in expressions', async function () {
    let tree = fromMarkdown('A {/*b*/ c // d\n} e {/* f */}.', {
      extensions: [mdxExpression({acorn, addResult: true})],
      mdastExtensions: [mdxExpressionFromMarkdown()]
    })

    removePosition(tree, {force: true})

    // Cheap clone to remove non-JSON values.
    // eslint-disable-next-line unicorn/prefer-structured-clone -- `JSON` to drop instances.
    tree = JSON.parse(JSON.stringify(tree))

    assert.deepEqual(tree, {
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
                          start: {line: 1, column: 9, offset: 9},
                          end: {line: 1, column: 10, offset: 10}
                        },
                        range: [9, 10]
                      },
                      start: 3,
                      end: 16,
                      loc: {
                        start: {line: 1, column: 3, offset: 3},
                        end: {line: 2, column: 0, offset: 16}
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
                        start: {line: 1, column: 3, offset: 3},
                        end: {line: 1, column: 8, offset: 8}
                      },
                      range: [3, 8]
                    },
                    {
                      type: 'Line',
                      value: ' d',
                      start: 11,
                      end: 15,
                      loc: {
                        start: {line: 1, column: 11, offset: 11},
                        end: {line: 1, column: 15, offset: 15}
                      },
                      range: [11, 15]
                    }
                  ],
                  loc: {
                    start: {line: 1, column: 3, offset: 3},
                    end: {line: 2, column: 0, offset: 16}
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
                        start: {line: 2, column: 5, offset: 21},
                        end: {line: 2, column: 12, offset: 28}
                      },
                      range: [21, 28]
                    }
                  ],
                  loc: {
                    start: {line: 2, column: 5, offset: 21},
                    end: {line: 2, column: 12, offset: 28}
                  },
                  range: [21, 28]
                }
              }
            },
            {type: 'text', value: '.'}
          ]
        }
      ]
    })
  })
})

test('mdxExpressionToMarkdown()', async function (t) {
  await t.test('should serialize flow expressions', async function () {
    assert.deepEqual(
      toMarkdown(
        {
          type: 'root',
          children: [
            {type: 'mdxFlowExpression', value: 'a + b'},
            {type: 'mdxFlowExpression', value: '\nc +\n1\n'},
            // @ts-expect-error: check how the runtime handles `value` missing.
            {type: 'mdxFlowExpression'},
            {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
          ]
        },
        {extensions: [mdxExpressionToMarkdown()]}
      ),
      '{a + b}\n\n{\nc +\n1\n}\n\n{}\n\nd\n'
    )
  })

  await t.test('should serialize text expressions', async function () {
    assert.deepEqual(
      toMarkdown(
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'a '},
            {type: 'mdxTextExpression', value: 'b + c'},
            {type: 'text', value: ', d '},
            {type: 'mdxTextExpression', value: 'e + 1'},
            {type: 'text', value: ', f '},
            // @ts-expect-error: check how the runtime handles `value` missing.
            {type: 'mdxTextExpression'},
            {type: 'text', value: '.'}
          ]
        },
        {extensions: [mdxExpressionToMarkdown()]}
      ),
      'a {b + c}, d {e + 1}, f {}.\n'
    )
  })

  await t.test('should escape `{` in text', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'paragraph', children: [{type: 'text', value: 'a { b'}]},
        {extensions: [mdxExpressionToMarkdown()]}
      ),
      'a \\{ b\n'
    )
  })

  await t.test('should escape `{` at the start of a line', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'definition', identifier: 'a', url: 'x', title: 'a\n{\nb'},
        {extensions: [mdxExpressionToMarkdown()]}
      ),
      '[a]: x "a\n\\{\nb"\n'
    )
  })
})

test('roundtrip', async function (t) {
  await t.test(
    'should *not* strip superfluous whitespace depending on the opening prefix, when roundtripping expressions (flow)',
    async function () {
      assert.deepEqual(
        toMarkdown(
          fromMarkdown('  {`\n a\n `}', {
            extensions: [mdxExpression()],
            mdastExtensions: [mdxExpressionFromMarkdown()]
          }),
          {extensions: [mdxExpressionToMarkdown()]}
        ),
        '{`\n a\n `}\n'
      )
    }
  )

  await t.test(
    'should *not* strip superfluous whitespace (if there is more) when roundtripping expressions (flow)',
    async function () {
      assert.deepEqual(
        toMarkdown(
          fromMarkdown('  {`\n    a\n  `}', {
            extensions: [mdxExpression()],
            mdastExtensions: [mdxExpressionFromMarkdown()]
          }),
          {extensions: [mdxExpressionToMarkdown()]}
        ),
        '{`\n    a\n  `}\n'
      )
    }
  )

  await t.test(
    'should not strip consecutive lines in expressions (text)',
    async function () {
      assert.deepEqual(
        toMarkdown(
          fromMarkdown('a {`\n    b\n  `} c', {
            extensions: [mdxExpression()],
            mdastExtensions: [mdxExpressionFromMarkdown()]
          }),
          {extensions: [mdxExpressionToMarkdown()]}
        ),
        'a {`\n    b\n  `} c\n'
      )
    }
  )
})
