var ol = ol || {};

ol.mainVue = (function()
{
	// setup firebase
	let config = {
		apiKey: "AIzaSyAs9VTjiFNfzCnkUG_iMrN-iJ84dxD8fCk",
		authDomain: "culinarian-a7d11.firebaseapp.com",
		databaseURL: "https://culinarian-a7d11.firebaseio.com",
		projectId: "culinarian-a7d11",
		storageBucket: "",
		messagingSenderId: "831825993317"
	};
	firebase.initializeApp(config);
	
	let referencePoint = firebase.database().ref('searchTerms');
	
	const app = new Vue(
	{
		el: '#app',
		data: {
			title	:	'Culinomicon',
			
			defaultMealSearchUrl	:	'https://www.themealdb.com/api/json/v1/1/search.php?s=',
			areaMealSearch			:	'https://www.themealdb.com/api/json/v1/1/filter.php?a=',
			categoryMealSearch		:	'https://www.themealdb.com/api/json/v1/1/filter.php?c=',
			ingredientMealSearch	:	'https://www.themealdb.com/api/json/v1/1/filter.php?i=',
			idSearchUrl				:	'https://www.themealdb.com/api/json/v1/1/lookup.php?i=',
			
			//defaultCktlSearchUrl	:	'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=',
			//areaDrinkSearch			:	'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=',
			//categoryDrinkSearch		:	'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=',
			//ingredientDrinkSearch	:	'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=',
			
			defaultWikiInfoUrl		:	'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
			url						:	'https://www.themealdb.com/api/json/v1/1/search.php?s=',
			defaultWikiSearchUrl	:	'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=',
			wikiSearchUrlAppend		:	'&utf8=&format=json&origin=*',
			
			PROXY_URL : 'src/proxy.php?filename=',
			
			query		:	'',	// the search term
			picked		:	'Name',
			sortBy		:	'None',
			results		: 	-1,	// amount of search terms to display
			index		: 	-1,
			
			food		:	[],	// the array of food built out of meals and drinks
			foodItem	:	{},	// the array of information contained in each food item, broken down into a single array for that food
			foodDisplay	:	{},
			
			wikiTitle	:	'',	// what is being searched on wikipedia
			wikiNum		:	0,	// the wiki search's end destination
			wikiData	:	{},	// the collated text summary of the food item
			
			ingredientList	:	[],	// a list of all ingredient items
			ingredientAmnt	:	[], // a list of all ingredient amounts
			
			termList: referencePoint,
			amount	:	[],
			terms	:	[]
		},
		created()
		{
			this.picked 	= localStorage.getItem('picked') || 'Name';
			
			this.query		= localStorage.getItem('query') || '';
			
			this.results	= localStorage.getItem('results') || -1;
			
			this.sortBy		= localStorage.getItem('sortBy') || 'None';
		},
		watch:
		{
			picked: function()
			{
				localStorage.setItem('picked', this.picked);
			},
			query: function()
			{
				localStorage.setItem('query', this.query);
			},
			results: function()
			{
				localStorage.setItem('results', this.results);
			},
			sortBy: function()
			{
				localStorage.setItem('sortBy', this.sortBy);
			}
		},
		methods:
		{
			// FIREBASE METHODS
			pushFire()
			{
				this.query = this.query.toLowerCase();
				ol.firebase.pushOnFire(this.query);
			},
			
			// DISPLAY METHODS
			setIndex(id)	// takes the clicked on search result and returns a new page with info
			{
				this.url = this.idSearchUrl + id;
				this.idSearch('idSearch', '');
			},
			
			// MAIN METHODS
			buildMealLink()
			{
				if(this.picked === 'Name')
					this.url = this.defaultMealSearchUrl;
				else if (this.picked === 'Area')
					this.url = this.areaMealSearch;
				else if (this.picked === 'Category')
					this.url = this.categoryMealSearch;
				else if (this.picked === 'Ingredient')
					this.url = this.ingredientMealSearch;
				
				this.query.trim;

				this.url += this.query;
			},
			buildCktlLink()
			{
				if(this.picked === 'Name')
					this.url = this.defaultCktlSearchUrl;
				else if (this.picked === 'Area')
					this.url = this.areaDrinkSearch;
				else if (this.picked === 'Category')
					this.url = this.categoryDrinkSearch;
				else if (this.picked === 'Ingredient')
					this.url = this.ingredientDrinkSearch;
				
				this.query.trim;
				
				this.url += this.query;
			},
			search()
			{
				this.food = [];
				
				// save query to firebase 
				this.pushFire(this.query);
				
				// get meal information
				this.buildMealLink();
				//console.log(this.url);
				this.searchRunner('');
				
				
			},
			searchRunner(u = '')
			{
				//if (! this.term.trim()) return;
				//fetch(this.url, {'mode': 'no-cors'} || u)
				fetch(this.url || u)
				.then(response => 
				{
					if(!response.ok)
					{
						throw Error(`ERROR: ${response.statusText}`);
					}
					//JSON.stringify(response.json);
					
					return response.json();
				})
				.then(json => 
				{	
					/*
					if(!Array.isArray(this.food) || !this.food.length)
					{
						 || json.drinks;
						
					}
					else
					{
						// joins both meal and drink info, loading in whatever is loaded in first first
						this.food = this.food.concat(json.meals || json.drinks);
					}
					*/
					
					// create food array from meal data
					this.food = json.meals;
					
					if(this.sortBy === 'A->Z' && Array.isArray(this.food))
					{
						this.food.sort(function(a,b){
							if(a.strMeal < b.strMeal)
							{
								return -1;
							}
							if(a.strMeal > b.strMeal)
							{
								return 1;
							}
							return 0;
						});
					}
					else if(this.sortBy === 'Z->A' && Array.isArray(this.food))
					{
						this.food.sort(function(a,b){
							if(a.strMeal < b.strMeal)
							{
								return -1;
							}
							if(a.strMeal > b.strMeal)
							{
								return 1;
							}
							return 0;
						});
						this.food.reverse();
					}
				})
			},
			idSearch(type, u = '')
			{
				//if (! this.term.trim()) return;
				//fetch(this.url, {'mode': 'no-cors'} || u)
				fetch(this.url || u)
				.then(response => {
					if(!response.ok)
					{
						throw Error(`ERROR: ${response.statusText}`);
					}
					//JSON.stringify(response.json);
					
					return response.json();
				})
				.then(json => {	
					//console.log(json);
					
					if (type === 'idSearch')
					{
						this.foodItem = json.meals[0];
						
						// replace _ values with %20
						let str = this.foodItem.strMeal.replace(/ /g, '%20');
						
						// check to see if the wikipedia page exists
						this.url = this.defaultWikiSearchUrl + str + this.wikiSearchUrlAppend;
						
						fetch(this.url || u)
						.then(response => 
						{
							if(!response.ok)
							{
								throw Error(`ERROR: ${response.statusText}`);
							}
							//JSON.stringify(response.json);

							return response.json();
						})
						.then(json =>
						{
							this.wikiTitle = json.query.search[0].title;
							this.wikiNum = json.query.pages;
							
							
							let short = this.wikiTitle.replace(' ', '%20');
							
							//this.url = this.PROXY_URL + this.defaultWikiInfoUrl + this.wikiTitle;
							this.url = this.defaultWikiInfoUrl + short + '&origin=*';
							
							console.log(this.url);
							
							fetch(this.url || u)
							.then(response => {
								if(!response.ok)
								{
									throw Error(`ERROR: ${response.statusText}`);
								}
								//JSON.stringify(response.json);

								return response.json();
							})
							.then(json => 
							{
								// load information from page into a temporary value and pass it into the class constructor
								this.wikiData = json.query.pages;
								console.log(this.wikiData.extract);		
								//console.log(this.wikidata[this.wikiNum]);
								
								
								let b = Object.keys(json.query.pages);
								let c = json.query.pages[b[0]].extract;
								
								
								// check ingredient by hand, because thye weren't built into an object!
								this.ingredientCheck();
						
								this.foodDisplay = ol.cooker.createEdible(this.foodItem.strMeal, this.foodItem.strCategory, this.foodItem.strMealThumb, c, this.foodItem.strInstructions, this.ingredientList, this.ingredientAmnt, this.foodItem.strArea);
							})
						})
					}
				})				
			},
			ingredientCheck()
			{
				// get list of ingredients
				this.ingredientList = [];
				
				if(this.foodItem.strIngredient1 != '' && this.foodItem.strIngredient1 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient1)
				}
				if(this.foodItem.strIngredient2 != '' && this.foodItem.strIngredient2 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient2)
				}
				if(this.foodItem.strIngredient3 != '' && this.foodItem.strIngredient3 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient3)
				}
				if(this.foodItem.strIngredient4 != '' && this.foodItem.strIngredient4 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient4)
				}
				if(this.foodItem.strIngredient5 != '' && this.foodItem.strIngredient5 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient5)
				}
				if(this.foodItem.strIngredient6 != '' && this.foodItem.strIngredient6 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient6)
				}
				if(this.foodItem.strIngredient7 != '' && this.foodItem.strIngredient7 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient7)
				}
				if(this.foodItem.strIngredient8 != '' && this.foodItem.strIngredient8 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient8)
				}
				if(this.foodItem.strIngredient9 != '' && this.foodItem.strIngredient9 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient9)
				}
				if(this.foodItem.strIngredient10 != '' && this.foodItem.strIngredient10 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient10)
				}
				
				if(this.foodItem.strIngredient11 != '' && this.foodItem.strIngredient11 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient11)
				}
				if(this.foodItem.strIngredient12 != '' && this.foodItem.strIngredient12 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient12)
				}
				if(this.foodItem.strIngredient13 != '' && this.foodItem.strIngredient13 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient13)
				}
				if(this.foodItem.strIngredient14 != '' && this.foodItem.strIngredient14 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient14)
				}
				if(this.foodItem.strIngredient15 != '' && this.foodItem.strIngredient15 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient15)
				}
				if(this.foodItem.strIngredient16 != '' && this.foodItem.strIngredient16 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient16)
				}
				if(this.foodItem.strIngredient17 != '' && this.foodItem.strIngredient17 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient17)
				}
				if(this.foodItem.strIngredient18 != '' && this.foodItem.strIngredient18 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient18)
				}
				if(this.foodItem.strIngredient19 != '' && this.foodItem.strIngredient19 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient19)
				}
				if(this.foodItem.strIngredient20 != '' && this.foodItem.strIngredient20 != ' ')
				{
					this.ingredientList.push(this.foodItem.strIngredient20)
				}
				
				// get list of ingredients
				this.ingredientAmnt = [];
				
				if(this.foodItem.strMeasure1 != '' && this.foodItem.strMeasure1 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure1)
				}
				if(this.foodItem.strMeasure2 != '' && this.foodItem.strMeasure2 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure2)
				}
				if(this.foodItem.strMeasure3 != '' && this.foodItem.strMeasure3 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure3)
				}
				if(this.foodItem.strMeasure4 != '' && this.foodItem.strMeasure4 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure4)
				}
				if(this.foodItem.strMeasure5 != '' && this.foodItem.strMeasure5 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure5)
				}
				if(this.foodItem.strMeasure6 != '' && this.foodItem.strMeasure6 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure6)
				}
				if(this.foodItem.strMeasure7 != '' && this.foodItem.strMeasure7 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure7)
				}
				if(this.foodItem.strMeasure8 != '' && this.foodItem.strMeasure8 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure8)
				}
				if(this.foodItem.strMeasure9 != '' && this.foodItem.strMeasure9 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure9)
				}
				if(this.foodItem.strMeasure10 != '' && this.foodItem.strMeasure10 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure10)
				}
				
				if(this.foodItem.strMeasure11 != '' && this.foodItem.strMeasure11 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure11)
				}
				if(this.foodItem.strMeasure12 != '' && this.foodItem.strMeasure12 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure12)
				}
				if(this.foodItem.strMeasure13 != '' && this.foodItem.strMeasure13 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure13)
				}
				if(this.foodItem.strMeasure14 != '' && this.foodItem.strMeasure14 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure14)
				}
				if(this.foodItem.strMeasure15 != '' && this.foodItem.strMeasure15 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure15)
				}
				if(this.foodItem.strMeasure16 != '' && this.foodItem.strMeasure16 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure16)
				}
				if(this.foodItem.strMeasure17 != '' && this.foodItem.strMeasure17 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure17)
				}
				if(this.foodItem.strMeasure18 != '' && this.foodItem.strMeasure18 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure18)
				}
				if(this.foodItem.strMeasure19 != '' && this.foodItem.strMeasure19 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure19)
				}
				if(this.foodItem.strMeasure20 != '' && this.foodItem.strMeasure20 != ' ')
				{
					this.ingredientAmnt.push(this.foodItem.strMeasure20)
				}
			}
		}
	});
	
	return{
		firePoint: referencePoint
	};
})();