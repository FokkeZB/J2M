# Changes

This file is a manually maintained list of changes for each release. Feel free to add your changes here when sending pull requests. Also send corrections if you spot any mistakes.

### 1.4.0

* Initial public release

### 1.5.0 (2016-01-29)

* Additional features added: tables and panels.
* Color is now stripped when converting from jira to markdown as standard markdown does not support color.

### 2.0.0 (2016-07-07)

* Removed citations due to a bug

## 2.0.2 (2017-08-22)

* Fixed a bug in how titled code blocks were rendered

## 2.0.3 (2017-09-15)

* Fixed a bug where dashes were being converted to strike throughs in situations they shouldn't have been. Before the fix, the string "ABC-1234 and DEF-5678" would have been converted to (HTML): "ABC<del>1234 and DEV</del>5678" or (Markdown): "ABC~~1234 and DEV~~5678" which is invalid. After the fix, no strikethroughs will be added to the converted output unless there is at least 1 space before the first dash (or double tilde) and after the last dash (or double tilde).
