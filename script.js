var j = ace.edit("j");
j.setTheme("ace/theme/twilight");

function toM() {
  converted = j.getValue();

  converted = converted.replace(/^h([0-6])\.(.*)$/gm, function (match,level,content) {
    return Array(parseInt(level) + 1).join('#') + content;
  });

  converted = converted.replace(/([*_])(.*)\1/g, function (match,wrapper,content) {
    var to = (wrapper === '*') ? '**' : '*';
    return to + content + to;
  });

  converted = converted.replace(/\{\{(.*?)\}\}/g, '`$1`');
  converted = converted.replace(/\?\?(.*?)\?\?/g, '<cite>$1</cite>');
  converted = converted.replace(/\+(.*?)\+/g, '<ins>$1</ins>');
  converted = converted.replace(/\^(.*?)\^/g, '<sup>$1</sup>');
  converted = converted.replace(/~(.*?)~/g, '<sub>$1</sub>');
  converted = converted.replace(/-(.*?)-/g, '~~$1~~');

  converted = converted.replace(/\{code(:([a-z]+))?\}([^]*)\{code\}/gm, '```$2$3```');

  converted = converted.replace(/\[(.+?)\|(.+)\]/g, '[$1]($2)');
  converted = converted.replace(/\[(.+?)\]([^\(]*)/g, '<$1>$2');

  m.setValue(converted);
}
  
j.on('focus', function(e) {
  j.getSession().on('change', toM);
});

j.on('blur', function(e) {
console.log('off focus');
  j.getSession().off('change', toM);
});

var m = ace.edit("m");
m.setTheme("ace/theme/twilight");
m.getSession().setMode("ace/mode/markdown");

function toJ() {
  converted = m.getValue();

  converted = converted.replace(/^(.*?)\n([=-])+$/gm, function (match,content,level) {
    return 'h' + (level[0] === '=' ? 1 : 2) + '. ' + content;
  });

  converted = converted.replace(/^([#]+)(.*?)$/gm, function (match,level,content) {
    return 'h' + level.length + '.' + content;
  });

  converted = converted.replace(/([*_]+)(.*?)\1/g, function (match,wrapper,content) {
    var to = (wrapper.length === 1) ? '_' : '*';
    return to + content + to;
  });

  var map = {
    cite: '??',
    del: '-',
    ins: '+',
    sup: '^',
    sub: '~'
  };

  converted = converted.replace(new RegExp('<(' + Object.keys(map).join('|') + ')>(.*?)<\/\\1>', 'g'), function (match,from,content) {
    console.log(from);
    var to = map[from];
    return to + content + to;
  });

  converted = converted.replace(/~~(.*?)~~/g, '-$1-');
  
  converted = converted.replace(/```([a-z]+)?([^]*)```/gm, function(match,synt,content) {
    var code = '{code';

    if (synt) {
      code += ':' + synt;
    }

    code += '}' + content + '{code}';

    return code;
  });

  converted = converted.replace(/`(.*?)`/g, '{{$1}}');

  converted = converted.replace(/\[(.+?)\]\((.+)\)/g, '[$1|$2]');
  converted = converted.replace(/<(.+?)>/g, '[$1]');

  j.setValue(converted);
}

m.on('focus', function(e) {
  m.getSession().on('change', toJ);
});

m.on('blur', function(e) {
  m.getSession().off('change', toJ);
});
