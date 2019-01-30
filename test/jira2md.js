var should = require('chai').should();
// var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var j2m = require('../index.js');

describe('to_markdown', function () {
  it('should exist', function () {
    should.exist(j2m.to_markdown);
  });

  it('should be a function', function () {
    j2m.to_markdown.should.be.a('function');
  });

  describe('emphasis formatting', function () {
    describe('bold formatting', function () {
      it('should convert bolds properly', function () {
        var markdown = j2m.to_markdown('*bold words*');
        markdown.should.eql('**bold words**');
      });

      it("should handle multiple bold sections in a line", function () {
        var markdown = j2m.to_markdown("*this should be bold* this should not *this should be bold*");
        markdown.should.eql("**this should be bold** this should not **this should be bold**");
      });

      it("does not perform intraword formatting on asterisks", function () {
        var markdown = j2m.to_markdown("a*phrase*with*asterisks");
        markdown.should.eql("a*phrase*with*asterisks");
      });

      it('does not apply bold formatting without an underscore at the end of the phrase', function () {
        var markdown = j2m.to_markdown('*a*phrase');
        markdown.should.eql('*a*phrase');
      });

      it('formats bolds while leaving intraword asterisks untouched', function () {
        var markdown = j2m.to_markdown('*bold*phrase*with*internal*asterisks*');
        markdown.should.eql('**bold*phrase*with*internal*asterisks**');
      });

      it('handles bolds at the end of sentences', function () {
        var markdown = j2m.to_markdown('A sentence ending in *bold*.');
        markdown.should.eql('A sentence ending in **bold**.');
      });
    });

    describe('italic formatting', function () {
      it('should convert italics properly', function () {
        var markdown = j2m.to_markdown('_italic_');
        markdown.should.eql('*italic*');
      });

      it("should handle multiple italic sections in a line", function () {
        var markdown = j2m.to_markdown("_this should be italic_ this should not _this should be italic_");
        markdown.should.eql("*this should be italic* this should not *this should be italic*");
      });

      it('does not perform intraword formatting on underscores', function () {
        var markdown = j2m.to_markdown('a_phrase_with_underscores');
        markdown.should.eql('a_phrase_with_underscores');
      });

      it('does not apply italic formatting without an underscore at the end of the phrase', function () {
        var markdown = j2m.to_markdown('_a_phrase');
        markdown.should.eql('_a_phrase');
      });

      it('formats italics while leaving intraword underscores untouched', function () {
        var markdown = j2m.to_markdown('_italic_phrase_with_internal_underscores_');
        markdown.should.eql('*italic_phrase_with_internal_underscores*');
      });

      it('handles italics at the end of sentences', function () {
        var markdown = j2m.to_markdown('A sentence ending in _italic_.');
        markdown.should.eql('A sentence ending in *italic*.');
      });
    });

    it('should handle bold AND italic (combined) correctly', function () {
      var markdown = j2m.to_markdown("This is _*emphatically bold*_!");
      markdown.should.eql("This is ***emphatically bold***!");
    });
  });

  it('should convert monospaced content properly', function () {
    var markdown = j2m.to_markdown('{{monospaced}}');
    markdown.should.eql('`monospaced`');
  });

  //it('should convert citations properly', function() {
  //    var markdown = j2m.to_markdown('??citation??');
  //    markdown.should.eql('<cite>citation</cite>');
  //});

  it('should convert strikethroughs properly', function () {
    var markdown = j2m.to_markdown('-deleted-');
    markdown.should.eql('~~deleted~~');
  });

  it('should convert inserts properly', function () {
    var markdown = j2m.to_markdown('+inserted+');
    markdown.should.eql('<ins>inserted</ins>');
  });

  it('should convert superscript properly', function () {
    var markdown = j2m.to_markdown('^superscript^');
    markdown.should.eql('<sup>superscript</sup>');
  });

  it('should convert subscript properly', function () {
    var markdown = j2m.to_markdown('~subscript~');
    markdown.should.eql('<sub>subscript</sub>');
  });

  it('should convert preformatted blocks properly', function () {
    var markdown = j2m.to_markdown("{noformat}\nso *no* further _formatting_ is done here\n{noformat}");
    markdown.should.eql("```\nso *no* further _formatting_ is done here\n```");
  });

  describe('code block formatting', function () {
    it('should not apply formatting within codeblocks', function () {
      var markdown = j2m.to_markdown("{code}\nso *no* further _formatting_ is done here\n{code}");
      markdown.should.eql("```\nso *no* further _formatting_ is done here\n```");
    });

    it('should convert language-specific code blocks properly', function () {
      var markdown = j2m.to_markdown("{code:javascript}\nvar hello = 'world';\n{code}");
      markdown.should.eql("```javascript\nvar hello = 'world';\n```");
    });

    it('should convert code without language-specific and with title into code block', function () {
      var markdown = j2m.to_markdown("{code:title=Foo.java}\nclass Foo {\n  public static void main() {\n  }\n}\n{code}");
      markdown.should.eql("```\nclass Foo {\n  public static void main() {\n  }\n}\n```");
    });

    it('should convert fully configured code block', function () {
      var markdown = j2m.to_markdown(
        "{code:xml|title=My Title|borderStyle=dashed|borderColor=#ccc|titleBGColor=#F7D6C1|bgColor=#FFFFCE}"
        + "\n    <test>"
        + "\n        <another tag=\"attribute\"/>"
        + "\n    </test>"
        + "\n{code}");
      markdown.should.eql(
        "```xml"
        + "\n    <test>"
        + "\n        <another tag=\"attribute\"/>"
        + "\n    </test>"
        + "\n```");
    });

    it('should convert multiple codeblocks properly', function () {
      var markdown = j2m.to_markdown("{code:title=Foo.java}\nclass Foo {\n  public static void main() {\n  }\n}\n{code} \n {code:title=Foo.java}\nclass Foo {\n  public static void main() {\n  }\n}\n{code}");
      markdown.should.eql("```\nclass Foo {\n  public static void main() {\n  }\n}\n``` \n ```\nclass Foo {\n  public static void main() {\n  }\n}\n```");
    });
  });

  it('should convert unnamed links properly', function () {
    var markdown = j2m.to_markdown("[http://google.com]");
    markdown.should.eql("<http://google.com>");
  });

  it('should convert named links properly', function () {
    var markdown = j2m.to_markdown("[Google|http://google.com]");
    markdown.should.eql("[Google](http://google.com)");
  });

  it('should convert headers properly', function () {
    var h1 = j2m.to_markdown("h1. Biggest heading");
    var h2 = j2m.to_markdown("h2. Bigger heading");
    var h3 = j2m.to_markdown("h3. Big heading");
    var h4 = j2m.to_markdown("h4. Normal heading");
    var h5 = j2m.to_markdown("h5. Small heading");
    var h6 = j2m.to_markdown("h6. Smallest heading");
    h1.should.eql("# Biggest heading");
    h2.should.eql("## Bigger heading");
    h3.should.eql("### Big heading");
    h4.should.eql("#### Normal heading");
    h5.should.eql("##### Small heading");
    h6.should.eql("###### Smallest heading");
  });

  it('should convert blockquotes properly', function () {
    var markdown = j2m.to_markdown("bq. This is a long blockquote type thingy that needs to be converted.");
    markdown.should.eql("> This is a long blockquote type thingy that needs to be converted.");
  });

  describe('list formatting', function () {
    it('should convert un-ordered lists properly', function () {
      var markdown = j2m.to_markdown("* Foo\n* Bar\n* Baz\n** FooBar\n** BarBaz\n*** FooBarBaz\n* Starting Over");
      markdown.should.eql("* Foo\n* Bar\n* Baz\n  * FooBar\n  * BarBaz\n    * FooBarBaz\n* Starting Over");
    });

    it('should convert ordered lists properly', function () {
      var markdown = j2m.to_markdown("# Foo\n# Bar\n# Baz\n## FooBar\n## BarBaz\n### FooBarBaz\n# Starting Over");
      markdown.should.eql("1. Foo\n1. Bar\n1. Baz\n  1. FooBar\n  1. BarBaz\n    1. FooBarBaz\n1. Starting Over");
    });

    it('should handle bold within a un-ordered list item', function () {
      var markdown = j2m.to_markdown("* This is not bold!\n** This is *bold*.");
      markdown.should.eql("* This is not bold!\n  * This is **bold**.");
    });
  });

  it('should be able to handle a complicated multi-line jira-wiki string and convert it to markdown', function () {
    var jira_str = fs.readFileSync(path.resolve(__dirname, 'test.jira'), "utf8");
    var md_str = fs.readFileSync(path.resolve(__dirname, 'test.md'), "utf8");
    var markdown = j2m.to_markdown(jira_str);
    markdown.should.eql(md_str);
  });

  it('should not recognize strikethroughs over multiple lines', function () {
    var markdown = j2m.to_markdown("* Here's an un-ordered list line\n* Multi-line strikethroughs shouldn't work.");
    markdown.should.eql("* Here's an un-ordered list line\n* Multi-line strikethroughs shouldn't work.");
  });

  it('should remove color attributes', function () {
    var markdown = j2m.to_markdown("A text with{color:blue} blue \n lines {color} is not necessary.");
    markdown.should.eql("A text with blue \n lines  is not necessary.");
  });
});
