# jira2md

## JIRA to MarkDown text format converter
Convert from JIRA text formatting to GitHub Flavored MarkDown and back again.

## Credits
This module was heavily inspired by the J2M project by Fokke Zandbergen (http://j2m.fokkezb.nl/). Major credit to Fokke (and other contributors) for establishing a lot of the fundamental RexExp patterns for this module to work.

## Installation
npm install jira2md

## How to Use

### Markdown String

We'll refer to this as the `md` variable in the examples below.

```
**Some bold things**
*Some italic stuff*
## H2
<http://google.com>
```

### Atlassian Wiki Syntax

We'll refer to this as the `jira` variable in the examples below.

```
*Some bold things**
_Some italic stuff_
h2. H2
[http://google.com]
```

### Examples

```javascript
// Include the module
var j2m = require('jira2md');

// If converting from Mardown to Jira Wiki Syntax:
var jira = j2m.to_jira(md);

// If converting from Jira Wiki Syntax to Mardown:
var md = j2m.to_markdown(jira);
```
