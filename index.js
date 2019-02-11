const marked = require('marked');
marked.setOptions({
  breaks: true,
  smartyPants: true
});

class J2M {
  constructor(str) {
    this.str = str;
  }

  md_to_html(str) {
    return marked(str);
  };

  jira_to_html(str) {
    return marked(this.to_markdown(str));
  };

  to_jira(str) {
    let hash = splitOutCodeblocks(str, 'toJira');
    return transformHash(hash, 'toJira')
  };

  to_markdown(str) {
    let hash = splitOutCodeblocks(str, 'toMarkdown');
    return transformHash(hash, 'toMarkdown')
  };
};

const transformHash = function (hash, direction) {
  let string = ''

  if (direction == 'toMarkdown') {
    Object.keys(hash).forEach((key) => {
      if (hash[key]['code']) {
        string += codeblockToMarkdown(hash[key]['string']);
      } else {
        string += toMarkdownFormatting(hash[key]['string']);
      };
    });
  } else {
    Object.keys(hash).forEach((key) => {
      if (hash[key]['code']) {
        string += codeblockToJira(hash[key]['string']);
      } else {
        string += toJiraFormatting(hash[key]['string']);
      };
    });
  }
  return string
};

const splitOutCodeblocks = function (str, direction) {
  let hash = {};
  let array = [];

  // This block returns an array where each element is either a codeblock or is not
  if (direction == 'toMarkdown') {
    array = str.split(/(\{code[^]*?\{code\}|\{noformat[^]*?\{noformat\})/)
  } else if (direction == 'toJira') {
    array = str.split(/(```[^]*?```)/)
  } else {
    return [str]
  }

  array.map((string, index) => {
    hash[index] = {
      string: string,
      code: string.includes('```') || string.includes('{code}') || string.includes('{noformat}')
    }
  });

  return hash;
};

const codeblockToMarkdown = function (str) {
  return str
    .replace(
      /\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*?)\{code\}/gm, '```$2$5```'
    )
    // Pre-formatted text
    .replace(/{noformat}/g, '```')
};

const codeblockToJira = function (str) {
  return str
    .replace(/`{3,}(\w+)?((?:\n|[^`])+)`{3,}/g, function (_match, synt, content) {
      let code = '{code';
      if (synt) code += ':' + synt;
      return code + '}' + content + '{code}';
    })
};

const toMarkdownFormatting = function (str) {
  return str
    // Ordered Lists
    .replace(/^[ \t]*(\*+)\s+/gm, function (_match, stars) {
      return Array(stars.length).join("  ") + '* ';
    })
    // Un-ordered lists
    .replace(/^[ \t]*(#+)\s+/gm, function (_match, nums) {
      return Array(nums.length).join("  ") + '1. ';
    })
    // Headers 1-6
    .replace(/^h([0-6])\.(.*)$/gm, function (_match, level, content) {
      return Array(parseInt(level) + 1).join('#') + content;
    })
    // Bold
    .replace(/(\s|^|\_)\*(\S.*?)\*($|[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]|\s)/g, '$1**$2**$3')
    // Italic
    .replace(/(\s|^|\*)\_(\S.*?)\_($|[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]|\s)/g, '$1*$2*$3')
    // Monospaced text
    .replace(/\{\{([^}]+)\}\}/g, '`$1`')
    // Citations (buggy)
    //.replace(/\?\?((?:.[^?]|[^?].)+)\?\?/g, '<cite>$1</cite>')
    // Inserts
    .replace(/\+([^+]*)\+/g, '<ins>$1</ins>')
    // Superscript
    .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
    // Subscript
    .replace(/~([^~]*)~/g, '<sub>$1</sub>')
    // Strikethrough
    .replace(/(\s|^)+-(\S+.*?\S)-+/g, '$1~~$2~~')
    // Un-named Links
    .replace(/\[([^|]+)\]/g, '<$1>')
    // Named Links
    .replace(/\[(.+?)\|(.+)\]/g, '[$1]($2)')
    // Single Paragraph Blockquote
    .replace(/^bq\.\s+/gm, '> ')
    // Remove color: unsupported in md
    .replace(/\{color:[^}]+\}([^]*)\{color\}/gm, '$1')
    // panel into table
    .replace(/\{panel:title=([^}]*)\}\n?([^]*?)\n?\{panel\}/gm, '\n| $1 |\n| --- |\n| $2 |')
    // table header
    .replace(/^[ \t]*((?:\|\|.*?)+\|\|)[ \t]*$/gm, function (_match, headers) {
      const singleBarred = headers.replace(/\|\|/g, '|');
      return '\n' + singleBarred + '\n' + singleBarred.replace(/\|[^|]+/g, '| --- ');
    })
    // remove leading-space of table headers and rows
    .replace(/^[ \t]*\|/gm, '|');
};

const toJiraFormatting = function (str) {
  const map = {
    //cite: '??',
    del: '-',
    ins: '+',
    sup: '^',
    sub: '~'
  };

  return str
    // Bold, Italic, and Combined (bold+italic)
    .replace(/(\s?|^)([*_]+)(\S.*?)\2(\s|[~`!@#$%^&()\{\}\[\];:"'<,\.>?\/\\|+=-]|$)/gm, function (_match, opening_chars, wrapper, content, closing_chars) {
      switch (wrapper.length) {
        case 1: return opening_chars + '_' + content + '_' + closing_chars;
        case 2: return opening_chars + "*" + content + "*" + closing_chars;
        case 3: return opening_chars + "_*" + content + "*_" + closing_chars;
        default: return opening_chars + wrapper + content * wrapper + closing_chars;
      }
    })
    // All Headers (# format)
    .replace(/^([#]+)(.*?)$/gm, function (_match, level, content) {
      return 'h' + level.length + '.' + content;
    })
    // Headers (H1 and H2 underlines)
    .replace(/^(.*?)\n([=-]+)$/gm, function (_match, content, level) {
      return 'h' + (level[0] === '=' ? 1 : 2) + '. ' + content;
    })
    // Ordered lists
    .replace(/^([ \t]*)\d+\.\s+/gm, function (_match, spaces) {
      return Array(Math.floor(spaces.length / 2 + 1)).join("#") + '# ';
    })
    // Un-Ordered Lists
    .replace(/^([ \t]*)\*\s+/gm, function (_match, spaces) {
      return Array(Math.floor(spaces.length / 2 + 1)).join("*") + '* ';
    })
    // Headers (h1 or h2) (lines "underlined" by ---- or =====)
    // Citations, Inserts, Subscripts, Superscripts, and Strikethroughs
    .replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)<\/\\1>', 'g'), function (_match, from, content) {
      const to = map[from];
      return to + content + to;
    })
    // Other kind of strikethrough
    .replace(/(\s|^)+\~~(.*?)\~~+/g, '$1-$2-')
    // Inline-Preformatted Text
    .replace(/`([^`]+)`/g, '{{$1}}')
    // Named Link
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]')
    // Un-Named Link
    .replace(/<([^>]+)>/g, '[$1]')
    // Single Paragraph Blockquote
    .replace(/^>/gm, 'bq.')
    // tables
    .replace(/^\n((?:\|.*?)+\|)[ \t]*\n((?:\|\s*?\-{3,}\s*?)+\|)[ \t]*\n((?:(?:\|.*?)+\|[ \t]*\n)*)$/gm,
      function (match, headerLine, separatorLine, rowstr) {
        const headers = headerLine.match(/[^|]+(?=\|)/g);
        const separators = separatorLine.match(/[^|]+(?=\|)/g);
        if (headers.length !== separators.length) {
          return match;
        }
        const rows = rowstr.split('\n');
        if (rows.length === 1 + 1 && headers.length === 1) {
          // panel
          return '{panel:title=' + headers[0].trim() + '}\n' +
            rowstr.replace(/^\|(.*)[ \t]*\|/, '$1').trim() +
            '\n{panel}\n';
        } else {
          return '||' + headers.join('||') + '||\n' + rowstr;
        }
      });

};

module.exports = new J2M();
