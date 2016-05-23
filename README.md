# J2M
## JIRA to MarkDown text format converter
Convert from JIRA text formatting to GitHub Flavored MarkDown and back again. Just because I got tired of reformatting text between GitHub (PR's) and JIRA.


## Library
### Installation
The J2M library is available via bower (for frontend usage) and npm (for node usage):

```
$ bower install J2M --save
```
```
$ npm install j2m --save
```

### Usage
J2M exposes 2 methods: `toJ` and `toM` for converting to Jira markup and to markdown.

- `J2M.toJ(markdown : string) : string`
- `J2M.toM(jira : string) : string`

#### Usage Example:
```JavaScript
var J2M = require('J2M');

var input = '## cool markdown';
var jira = J2M.toJ(input);
var markdownAgain = J2M.toM(jira);
```


## CLI
J2M is also available as a command line utility.

### Installation
```
$ npm install -g j2m
```

### Usage
```
$ j2m [--toM|--toJ] [--stdin] $filename 

Options: 
--toM, -m:    Treat input as jira text and convert it to Markdown 
--toJ, -j:    Treat input as markdown text and convert it to Jira 
--stdin:      Read input from stdin. In this case the give filename is ignored 
```

#### Usage Example
```bash
# convert notes to jira markup and copy it to the clipboard (mac)
j2m --toJ notes.md | pbcopy

# retrieve some file in jira markup and save it as markdown
curl http://someserver.com/jira.txt | j2m --toM --stdin > notee.md
```

## Website
Use J2M online at: [http://j2m.fokkezb.nl/](http://j2m.fokkezb.nl/) (updated automagically)

## Roadmap
I hope to extend TiCons with the following features:

* Add as much syntax support as time allows me and need drives me :)

Feel free to [mail](mail@fokkezb.nl) me or fork the code and send a pull-request.

## License

<pre>
Copyright 2013 Fokke Zandbergen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>