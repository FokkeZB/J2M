var J2M = function() {};

J2M.prototype.to_markdown = function(str) {
    return str
        // Ordered Lists
        .replace(/^\s*(\*+)\s+/gm, function(match, stars) {
            return Array(stars.length).join(" ") + '* ';
        })
        // Un-ordered lists
        .replace(/^\s*(#+)\s+/gm, function(match, nums) {
            return Array(nums.length).join(" ") + '1. ';
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
        // Citations
        .replace(/\?\?((?:.[^?]|[^?].)+)\?\?/g, '<cite>$1</cite>')
        // Inserts
        .replace(/\+([^+]*)\+/g, '<ins>$1</ins>')
        // Superscript
        .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
        // Subscript
        .replace(/~([^~]*)~/g, '<sub>$1</sub>')
        // Strikethrough
        .replace(/-([^-]*)-/g, '~~$1~~')
        // Code Block
        .replace(/\{code(:([a-z]+))?\}([^]*)\{code\}/gm, '```$2$3```')
        // Pre-formatted text
        .replace(/{noformat}/g, '```')
        // Un-named Links
        .replace(/\[([^|]+)\]/g, '<$1>')
        // Named Links
        .replace(/\[(.+?)\|(.+)\]/g, '[$1]($2)')
        // Blockquotes
        .replace(/^bq\.\s+/gm, '> ')
};

J2M.prototype.to_jira = function(str) {
    var map = {
      cite: '??',
      del: '-',
      ins: '+',
      sup: '^',
      sub: '~'
    };

    return str
        .replace(/^(.*?)\n([=-])+$/gm, function (match,content,level) {
            return 'h' + (level[0] === '=' ? 1 : 2 + '. ' + content);
        })
        .replace(/^([#]+)(.*?)$/gm, function (match,level,content) {
            return 'h' + level.length + '.' + content;
        })
        .replace(/([*_]+)(.*?)\1/g, function (match,wrapper,content) {
            var to = (wrapper.length === 1 ? '_' : '*');
            return to + content + to;
        })
        .replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)<\/\\1>', 'g'), function (match,from,content) {
            var to = map[from];
            return to + content + to;
        })
        .replace(/~~(.*?)~~/g, '-$1-')
        .replace(/`{3,}(\w+)?((?:\n|[^`])+)`{3,}/g, function(match, synt, content) {
            var code = '{code';
            if (synt) code += ':' + synt;
            return code + '}' + content + '{code}';
        })
        .replace(/`([^`]+)`/g, '{{$1}}')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]')
        .replace(/<([^>]+)>/g, '[$1]')
        .replace(/^>/gm, 'bq.');
}

module.exports = new J2M();
