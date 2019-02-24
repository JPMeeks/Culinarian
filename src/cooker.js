'use strict';

var ol = ol || {};

ol.cooker = (function()
{	
	class edible
	{
		constructor(name, category, image, history, recipe, ingredients, amounts, area)
		{
			this.name 		= 	name;
			this.category	=	category;
			this.image		= 	image;
			this.history	= 	history;
			this.recipe		= 	recipe;
			this.ingdnts	=	ingredients;
			this.amounts	= 	amounts;
			this.area		= 	area;
			
			for(let i in this.ingdnts)
			{
				this.ingdnts[i] = amounts[i] + ' of ' + ingredients[i];
			}
		}
	}
	
	class meal extends edible
	{
		constructor(area)
		{
			super();
			this.area = area;
		}
	}
	
	class drink extends edible
	{
		constructor(glass)
		{
			super();
			this.glass = glass;
		}
	}
	
	function createEdible(name, category, image, history, recipe, ingredients, amounts, area)
	{
		let f = new edible(name, category, image, history, recipe, ingredients, amounts, area);
		
		return f;
	}
	
	return {
		createEdible	:	createEdible
	};
})();

