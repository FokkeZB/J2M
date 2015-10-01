var J2M = function() {};

J2M.prototype.to_markdown = function(str) {
    return str
        .replace(/^h([0-6])\.(.*)$/gm, function (match, level, content) {
            return Array(parseInt(level) + 1).join('#') + content;
        })
        .replace(/([*_])(.*)\1/g, function (match,wrapper,content) {
            var to = (wrapper === '*' ? '**' : '*');
            return to + content + to;
        })
        .replace(/\{\{([^}]+)\}\}/g, '`$1`')
        .replace(/\?\?((?:.[^?]|[^?].)+)\?\?/g, '<cite>$1</cite>')
        .replace(/\+([^+]*)\+/g, '<ins>$1</ins>')
        .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
        .replace(/~([^~]*)~/g, '<sub>$1</sub>')
        .replace(/-([^-]*)-/g, '~~$1~~')
        .replace(/\{code(:([a-z]+))?\}([^]*)\{code\}/gm, '```$2$3```')
        .replace(/\[(.+?)\|(.+)\]/g, '[$1]($2)')
        .replace(/\[(.+?)\]([^\(]*)/g, '<$1>$2')
        .replace(/{noformat}/g, '```');
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
        .replace(/<([^>]+)>/g, '[$1]');
}

module.exports = new JRM();
