'use strict'
var app = app || {};

app.helper = (function()
{
	function fillText(ctx, string, x, y, css, color)
	{
		ctx.save();

		ctx.font = css;
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);

		ctx.restore();
	}

	function strokeText(ctx, string, x, y, linewidth, css, color)
	{
		ctx.save();

		ctx.font = css;
		ctx.strokeStyle = color;
		ctx.lineWidth = linewidth;
		ctx.strokeText(string, x, y);

		ctx.restore();
	}
	
	return {
		fillText: fillText,
		strokeText: strokeText
	};
})();