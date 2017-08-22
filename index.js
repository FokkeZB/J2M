var marked = require('marked');
marked.setOptions({
	breaks: true,
	smartyPants: true
});

var J2M = function() {};

J2M.prototype.md_to_html = function(str) {
	return marked(str);
};

J2M.prototype.jira_to_html = function(str) {
	return marked(this.to_markdown(str));
};

J2M.prototype.to_markdown = function(str) {
    return str
        // Ordered Lists
        .replace(/^[ \t]*(\*+)\s+/gm, function(match, stars) {
            return Array(stars.length).join("  ") + '* ';
        })
        // Un-ordered lists
        .replace(/^[ \t]*(#+)\s+/gm, function(match, nums) {
            return Array(nums.length).join("  ") + '1. ';
        })
        // Headers 1-6
        .replace(/^h([0-6])\.(.*)$/gm, function (match, level, content) {
            return Array(parseInt(level) + 1).join('#') + content;
        })
        // Bold
        .replace(/\*(\S.*)\*/g, '**$1**')
        // Italic
        .replace(/\_(\S.*)\_/g, '*$1*')
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
        .replace(/-(\S+.*?\S)-/g, '~~$1~~')
        // Code Block
        .replace(/\{code(:([a-z]+))?([:|]?(title|borderStyle|borderColor|borderWidth|bgColor|titleBGColor)=.+?)*\}([^]*)\{code\}/gm, '```$2$5```')
        // Pre-formatted text
        .replace(/{noformat}/g, '```')
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
        .replace(/^[ \t]*((?:\|\|.*?)+\|\|)[ \t]*$/gm, function (match, headers) {
            var singleBarred =  headers.replace(/\|\|/g,'|');
            return '\n' + singleBarred + '\n' + singleBarred.replace(/\|[^|]+/g, '| --- ');
        })
        // remove leading-space of table headers and rows
        .replace(/^[ \t]*\|/gm, '|');

};

J2M.prototype.to_jira = function(str) {
    var map = {
      //cite: '??',
      del: '-',
      ins: '+',
      sup: '^',
      sub: '~'
    };

    return str
        // Bold, Italic, and Combined (bold+italic)
        .replace(/([*_]+)(\S.*?)\1/g, function (match,wrapper,content) {
            switch (wrapper.length) {
                case 1: return '_' + content + '_';
                case 2: return '*' + content + '*';
                case 3: return '_*' + content + '*_';
                default: return wrapper + content * wrapper;
            }
         })
         // All Headers (# format)
         .replace(/^([#]+)(.*?)$/gm, function (match,level,content) {
             return 'h' + level.length + '.' + content;
         })
         // Headers (H1 and H2 underlines)
         .replace(/^(.*?)\n([=-]+)$/gm, function (match,content,level) {
             return 'h' + (level[0] === '=' ? 1 : 2) + '. ' + content;
         })
        // Ordered lists
        .replace(/^([ \t]*)\d+\.\s+/gm, function(match, spaces) {
            return Array(Math.floor(spaces.length/2 + 1)).join("#") + '# ';
        })
        // Un-Ordered Lists
        .replace(/^([ \t]*)\*\s+/gm, function(match, spaces) {
            return Array(Math.floor(spaces.length/2 + 1)).join("*") + '* ';
        })
        // Headers (h1 or h2) (lines "underlined" by ---- or =====)
        // Citations, Inserts, Subscripts, Superscripts, and Strikethroughs
        .replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)<\/\\1>', 'g'), function (match,from,content) {
            var to = map[from];
            return to + content + to;
        })
        // Other kind of strikethrough
        .replace(/~~(.*?)~~/g, '-$1-')
        // Named/Un-Named Code Block
        .replace(/`{3,}(\w+)?((?:\n|[^`])+)`{3,}/g, function(match, synt, content) {
            var code = '{code';
            if (synt) code += ':' + synt;
            return code + '}' + content + '{code}';
        })
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
                     var headers = headerLine.match(/[^|]+(?=\|)/g);
                     var separators = separatorLine.match(/[^|]+(?=\|)/g);
                     if (headers.length !== separators.length) {
                         return match;
                     }
                     var rows = rowstr.split('\n');
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
