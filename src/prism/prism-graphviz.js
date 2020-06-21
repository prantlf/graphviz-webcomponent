import Prism from './prism-core'

Prism.languages.graphviz = {
  comment: [{
    pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
    greedy: true
  }, {
    pattern: /(^|[^\\:])\/\/.*/,
    lookbehind: !0,
    greedy: !0
  }],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: !0
  },
  'class-name': {
    pattern: /(\b(?:digraph|graph)\s+)\w+/,
    lookbehind: true
  },
  keyword: /\b(?:digraph|graph|node|edge)\b/,
  property: /\b(?:Damping|URL|area|arrowhead|arrowsize|arrowtail|aspect|bb|bgcolor|center|charset|clusterrank|color|colorscheme|comment|compound|concentrate|constraint|decorate|defaultdist|dim|dimen|dir|diredgeconstraints|distortion|dpi|edgeURL|edgehref|edgetarget|edgetooltip|epsilon|esep|fillcolor|fixedsize|fontcolor|fontname|fontnames|fontpath|fontsize|group|headURL|headclip|headhref|headlabel|headport|headtarget|headtooltip|height|href|id|image|imagepath|imagescale|label|labelURL|labelangle|labeldistance|labelfloat|labelfontcolor|labelfontname|labelfontsize|labelhref|labeljust|labelloc|labeltarget|labeltooltip|landscape|layer|layerlistsep|layers|layerselect|layersep|layout|len|levels|levelsgap|lhead|lheight|lp|ltail|lwidth|margin|maxiter|mclimit|mindist|minlen|mode|model|mosek|nodesep|nojustify|normalize|nslimit|nslimit1|ordering|orientation|outputorder|overlap|overlap_scaling|pack|packmode|pad|page|pagedir|pencolor|penwidth|peripheries|pin|pos|quadtree|quantum|rank|rankdir|ranksep|ratio|rects|regular|remincross|repulsiveforce|resolution|root|rotate|rotation|samehead|sametail|samplepoints|scale|searchsize|sep|shape|shapefile|showboxes|sides|size|skew|smoothing|sortv|splines|start|style|stylesheet|tail_lp|tailURL|tailclip|tailhref|taillabel|tailport|tailtarget|tailtooltip|target|tooltip|truecolor|vertices|viewport|voro_margin|weight|width|xlabel)\b/,
  constant: /\b(?:dot|neato|fdp|sfdp|twopi|circo|osage|patchwork|LR|RL|TB|BT|box|polygon|ellipse|oval|circle|point|egg|triangle|plaintext|plain|diamond|trapezium|parallelogram|house|pentagon|hexagon|septagon|octagon|doublecircle|doubleoctagon|tripleoctagon|invtriangle|invtrapezium|invhouse|Mdiamond|Msquare|Mcircle|rect|rectangle|square|star|none|underline|cylinder|note|tab|folder|box3d|component|promoter|cds|terminator|utr|primersite|restrictionsite|fivepoverhang|threepoverhang|noverhang|assembly|signature|insulator|ribosite|rnastab|proteasesite|proteinstab|rpromoter|rarrow|larrow|lpromoter|solid|dashed|dotted|bold|rounded|diagonals|filled|striped|wedged)\b/,
  boolean: /\b(?:true|yes|false|no)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /->|--|=/,
  punctuation: /[{}[\];(),.:]/
}
