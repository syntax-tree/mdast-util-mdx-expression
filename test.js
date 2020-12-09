var test = require('tape')
var acorn = require('acorn')
var fromMarkdown = require('mdast-util-from-markdown')
var toMarkdown = require('mdast-util-to-markdown')
var syntax = require('micromark-extension-mdx-expression')
var removePosition = require('unist-util-remove-position')
var mdxExpression = require('.')

test('markdown -> mdast', function (t) {
  t.deepEqual(
    fromMarkdown('{1 + 1}', {
      extensions: [syntax()],
      mdastExtensions: [mdxExpression.fromMarkdown]
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
      extensions: [syntax()],
      mdastExtensions: [mdxExpression.fromMarkdown]
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
        extensions: [syntax()],
        mdastExtensions: [mdxExpression.fromMarkdown]
      }),
      true
    ),
    {type: 'root', children: [{type: 'mdxFlowExpression', value: '\t \n'}]},
    'should support an empty flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a { b } c }', {
        extensions: [syntax()],
        mdastExtensions: [mdxExpression.fromMarkdown]
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
        extensions: [syntax({acorn: acorn})],
        mdastExtensions: [mdxExpression.fromMarkdown]
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
      extensions: [syntax()],
      mdastExtensions: [mdxExpression.fromMarkdown]
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
        extensions: [syntax()],
        mdastExtensions: [mdxExpression.fromMarkdown]
      }),
      true
    ).children[0],
    {
      type: 'paragraph',
      children: [
        {type: 'text', value: 'a '},
        {type: 'mdxTextExpression', value: '\t \n'},
        {type: 'text', value: ' c'}
      ]
    },
    'should support an empty text expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a { b } c }.', {
        extensions: [syntax()],
        mdastExtensions: [mdxExpression.fromMarkdown]
      }),
      true
    ).children[0],
    {
      type: 'paragraph',
      children: [
        {type: 'mdxTextExpression', value: ' a { b } c '},
        {type: 'text', value: '.'}
      ]
    },
    'should support an balanced braces in a flow expression (agnostic)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{ a /* { */ }.', {
        extensions: [syntax({acorn: acorn})],
        mdastExtensions: [mdxExpression.fromMarkdown]
      }),
      true
    ).children[0],
    {
      type: 'paragraph',
      children: [
        {type: 'mdxTextExpression', value: ' a /* { */ '},
        {type: 'text', value: '.'}
      ]
    },
    'should support a commented-out unbalanced brace in a flow expression (gnostic)'
  )

  t.deepEqual(
    JSON.parse(
      // Cheap clone to remove non-JSON values.
      JSON.stringify(
        removePosition(
          fromMarkdown('{a}.', {
            extensions: [syntax({acorn: acorn, addResult: true})],
            mdastExtensions: [mdxExpression.fromMarkdown]
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
                  type: 'Identifier',
                  start: 0,
                  end: 1,
                  loc: {start: {line: 1, column: 0}, end: {line: 1, column: 1}},
                  name: 'a'
                }
              }
            },
            {type: 'text', value: '.'}
          ]
        }
      ]
    },
    'should add a `data.estree` if `addResult` was used in the syntax plugin'
  )

  t.end()
})

test('mdast -> markdown', function (t) {
  t.deepEqual(
    toMarkdown(
      {
        type: 'root',
        children: [
          {type: 'mdxFlowExpression', value: 'a + b'},
          {type: 'mdxFlowExpression', value: '\nc +\n1\n'},
          {type: 'mdxFlowExpression'},
          {type: 'paragraph', children: [{type: 'text', value: 'd'}]}
        ]
      },
      {extensions: [mdxExpression.toMarkdown]}
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
          {type: 'mdxTextExpression'},
          {type: 'text', value: '.'}
        ]
      },
      {extensions: [mdxExpression.toMarkdown]}
    ),
    'a {b + c}, d {e + 1}, f {}.\n',
    'should serialize text expressions'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'paragraph', children: [{type: 'text', value: 'a { b'}]},
      {extensions: [mdxExpression.toMarkdown]}
    ),
    'a \\{ b\n',
    'should escape `{` in text'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'definition', url: 'x', title: 'a\n{\nb'},
      {extensions: [mdxExpression.toMarkdown]}
    ),
    '[]: x "a\n\\{\nb"\n',
    'should escape `{` at the start of a line'
  )

  t.end()
})
