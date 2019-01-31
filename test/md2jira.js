var should = require('chai').should();
var expect = require('chai').expect;
var fs = require('fs');
var path = require('path');
var j2m = require('../index.js');

describe('to_jira', function () {
  it('should exist', function () {
    should.exist(j2m.to_jira);
  });

  it('should be a function', function () {
    j2m.to_jira.should.be.a('function');
  });

  describe('emphasis formatting', function () {
    describe('bold formatting', function () {
      it('should convert bolds properly', function () {
        var jira = j2m.to_jira('**bold words**');
        jira.should.eql('*bold words*');
      });

      it("should handle multiple bold sections in a line", function () {
        var jira = j2m.to_jira("**this should be bold** this should not **this should be bold**");
        jira.should.eql("*this should be bold* this should not *this should be bold*");
      });

      it("does not perform intraword formatting on asterisks", function () {
        var jira = j2m.to_jira("a*phrase*with*asterisks");
        jira.should.eql("a*phrase*with*asterisks");
      });

      it('handles bolds at the end of sentences', function () {
        var jira = j2m.to_jira('A sentence ending in **bold**.');
        jira.should.eql('A sentence ending in *bold*.');
      });

      it('formats bolds while leaving intraword asterisks untouched', function () {
        var jira = j2m.to_jira('**bold*phrase*with*internal*asterisks**');
        jira.should.eql('*bold*phrase*with*internal*asterisks*');
      });

      // TODO: Fix the code so this test can ne unskipped
      it.skip('does not apply bold formatting without an asterisk pair at the start of the phrase', function () {
        var jira = j2m.to_jira('a**phrase**');
        jira.should.eql('a**phrase**');
      });

      it('does not apply bold formatting without an asterisk pair at the end of the phrase', function () {
        var jira = j2m.to_jira('**a**phrase');
        jira.should.eql('**a**phrase');
      });
    })

    describe('italic formatting', function () {
      it('should convert italics properly', function () {
        var jira = j2m.to_jira('*italic words*');
        jira.should.eql('_italic words_');
      });

      it("does not perform intraword formatting on underscores", function () {
        var jira = j2m.to_jira("a_phrase_with_underscores");
        jira.should.eql("a_phrase_with_underscores");
      });

      it('formats italics while leaving intraword underscores untouched', function () {
        var jira = j2m.to_jira('_italic_phrase_with_internal_underscores_');
        jira.should.eql('_italic_phrase_with_internal_underscores_');
      });

      it('handles italics at the end of sentences', function () {
        var jira = j2m.to_jira('A sentence ending in *italic*.');
        jira.should.eql('A sentence ending in _italic_.');
      });

      // TODO: Fix the code so this test can ne unskipped
      it.skip('does not apply italic formatting without asterisks at the start of the phrase', function () {
        var jira = j2m.to_jira('a*phrase*');
        jira.should.eql('a*phrase*');
      });

      it('does not apply italic formatting without asterisks at the end of the phrase', function () {
        var jira = j2m.to_jira('*a*phrase');
        jira.should.eql('*a*phrase');
      });
    })

    it('should handle bold AND italic (combined) correctly', function () {
      var jira = j2m.to_jira("This is ***emphatically bold***!");
      jira.should.eql("This is _*emphatically bold*_!");
    });

    it('handles a bold word followed by an italic word', function () {
      var jira = j2m.to_jira('**bold** *italic*');
      jira.should.eql('*bold* _italic_');
    });
  });

  it('should convert monospaced content properly', function () {
    var jira = j2m.to_jira('`monospaced words`');
    jira.should.eql('{{monospaced words}}');
  });

  // it('should convert citations properly', function () {
  //   var jira = j2m.to_jira('<cite>citation</cite>');
  //   jira.should.eql('??citation??');
  // });

  it('should convert strikethroughs properly', function () {
    var jira = j2m.to_jira('~~deleted~~');
    jira.should.eql('-deleted-');
  });

  it('should convert inserts properly', function () {
    var jira = j2m.to_jira('<ins>inserted</ins>');
    jira.should.eql('+inserted+');
  });

  it('should convert superscript properly', function () {
    var jira = j2m.to_jira('<sup>superscript</sup>');
    jira.should.eql('^superscript^');
  });

  it('should convert subscript properly', function () {
    var jira = j2m.to_jira('<sub>subscript</sub>');
    jira.should.eql('~subscript~');
  });

  describe.skip('codeblock formatting', function () {
    it('should convert preformatted blocks properly', function () {
      var jira = j2m.to_jira("```\nso *no* further **formatting** is done here\n```");
      jira.should.eql("{code}\nso _no_ further *formatting* is done here\n{code}");
    });

    it('should convert language-specific code blocks properly', function () {
      var jira = j2m.to_jira("```javascript\nvar hello = 'world';\n```");
      jira.should.eql("{code:javascript}\nvar hello = 'world';\n{code}");
    });
  });

  it('should convert unnamed links properly', function () {
    var jira = j2m.to_jira("<http://google.com>");
    jira.should.eql("[http://google.com]");
  });

  it('should convert named links properly', function () {
    var jira = j2m.to_jira("[Google](http://google.com)");
    jira.should.eql("[Google|http://google.com]");
  });

  it('should convert headers properly', function () {
    var h1 = j2m.to_jira("# Biggest heading");
    var h2 = j2m.to_jira("## Bigger heading");
    var h3 = j2m.to_jira("### Big heading");
    var h4 = j2m.to_jira("#### Normal heading");
    var h5 = j2m.to_jira("##### Small heading");
    var h6 = j2m.to_jira("###### Smallest heading");
    h1.should.eql("h1. Biggest heading");
    h2.should.eql("h2. Bigger heading");
    h3.should.eql("h3. Big heading");
    h4.should.eql("h4. Normal heading");
    h5.should.eql("h5. Small heading");
    h6.should.eql("h6. Smallest heading");
  });

  it('should convert underline-style headers properly', function () {
    var h1 = j2m.to_jira("Biggest heading\n=======");
    var h2 = j2m.to_jira("Bigger heading\n------");
    h1.should.eql("h1. Biggest heading");
    h2.should.eql("h2. Bigger heading");
  });

  it('should convert blockquotes properly', function () {
    var jira = j2m.to_jira("> This is a long blockquote type thingy that needs to be converted.");
    jira.should.eql("bq. This is a long blockquote type thingy that needs to be converted.");
  });

  describe('list formatting', function () {
    it('should convert un-ordered lists properly', function () {
      var jira = j2m.to_jira("* Foo\n* Bar\n* Baz\n  * FooBar\n  * BarBaz\n    * FooBarBaz\n* Starting Over");
      jira.should.eql("* Foo\n* Bar\n* Baz\n** FooBar\n** BarBaz\n*** FooBarBaz\n* Starting Over");
    });

    it('should convert ordered lists properly', function () {
      var jira = j2m.to_jira("1. Foo\n1. Bar\n1. Baz\n  1. FooBar\n  1. BarBaz\n    1. FooBarBaz\n1. Starting Over");
      jira.should.eql("# Foo\n# Bar\n# Baz\n## FooBar\n## BarBaz\n### FooBarBaz\n# Starting Over");
    });

    it('should handle bold within a un-ordered list item', function () {
      var jira = j2m.to_jira("* This is not bold!\n  * This is **bold**.");
      jira.should.eql("* This is not bold!\n** This is *bold*.");
    });
  });

  it('should be able to handle a complicated multi-line markdown string and convert it to markdown', function () {
    var jira_str = fs.readFileSync(path.resolve(__dirname, 'test.jira'), "utf8");
    var md_str = fs.readFileSync(path.resolve(__dirname, 'test.md'), "utf8");
    var jira = j2m.to_jira(md_str);
    jira.should.eql(jira_str);
  });

  it('should leave urls and emails unchanged', function () {
    var jira = j2m.to_jira('https://example_url_thing.com some_person@example_domain.com');
    jira.should.eql('https://example_url_thing.com some_person@example_domain.com');
  });
});

