/**
 * Sets up handlers for inputs
 *
 * TODO make more readable
 */
(function () {
	var jiraInput = ace.edit("j");
	var markdownInput = ace.edit("m");

	// setup inputs
	jiraInput.setTheme('ace/theme/twilight');
	markdownInput.setTheme('ace/theme/twilight');
	markdownInput.getSession().setMode('ace/mode/markdown');
	markdownInput.getSession().setUseWrapMode(true);

	var jiraCallback = function () {
		var markdown = J2M.toM(jiraInput.getValue());
		markdownInput.setValue(markdown);
	};

	var markdownCallback = function () {
		var jira = J2M.toJ(markdownInput.getValue());
		jiraInput.setValue(jira);
	};

	jiraInput.on('focus', function () {
		jiraInput.on('change', jiraCallback);
	});
	jiraInput.on('blur', function () {
		jiraInput.off('change', jiraCallback);
	});

	markdownInput.on('focus', function () {
		markdownInput.on('change', markdownCallback);
	});
	markdownInput.on('blur', function () {
		markdownInput.off('change', markdownCallback);
	});
})();
